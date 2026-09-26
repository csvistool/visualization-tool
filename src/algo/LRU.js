// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

// ─── Layout constants ────────────────────────────────────────────────────────

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const CAP_LABEL_X = 25;
const CAP_LABEL_Y = 40;

// Cache Table (Left side)
const MAP_TITLE_X = 25;
const MAP_TITLE_Y = 75;
const MAP_COL_KEY_X = 48;
const MAP_COL_REF_X = 98;
const MAP_COL_HEADER_Y = 100;
const MAP_START_Y = 130;
const MAP_ROW_GAP = 32;
const MAP_KEY_W = 46;
const MAP_REF_W = 34;
const MAP_ROW_H = 24;

// Doubly Linked List (Right side)
const DLL_START_X = 220;
const DLL_START_Y = 200;
const DLL_NODE_W = 65;
const DLL_NODE_H = 30;
const DLL_X_GAP = 95;

// Value label sits below each DLL node
const VAL_OFFSET_Y = DLL_NODE_H / 2 + 15;

// MRU / LRU badges sit with comfortable clearance above the DLL row
const BADGE_W = 45;
const BADGE_H = 22;
const BADGE_Y = DLL_START_Y - 50;

// Off-screen position used to "hide" canvas objects we can't destroy
const OFFSCREEN = -2000;

// ─── Colors ──────────────────────────────────────────────────────────────────

const MRU_COLOR = '#006400'; // dark green
const LRU_COLOR = '#CC0000'; // crimson red
const COMBO_BADGE_COLOR = '#4A148C'; // dark purple for capacity/size 1 MRU/LRU badge
const HIGHLIGHT_COLOR = '#FFD700'; // gold — insertion flash / update
const EVICT_COLOR = '#FF6666'; // red — eviction / deletion
const FOUND_COLOR = '#90EE90'; // light green — get hit
const MAP_LINK_COLOR = '#1976D2'; // blue for active Hash Map -> DLL node references
const KEY_CELL_BG = '#F8F9FA';
const PTR_CELL_BG = '#E3F2FD';
const CELL_BORDER = '#B0BEC5';
const WHITE = '#FFFFFF';

// ─── Limits ───────────────────────────────────────────────────────────────────

const MAX_CAPACITY = 10;
const DEFAULT_CAPACITY = 5;
const MAX_KEY_LENGTH = 4;
const MAX_VAL_LENGTH = 4;

// Keys that would cause prototype pollution
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// ─── Status Message Helpers ───────────────────────────────────────────────────

export const STATUS = {
	// Validation / Input errors
	NEED_KEY_VALUE: 'Please enter both a key and a value.',
	FORBIDDEN_KEY: key => `Key "${key}" is not allowed.`,
	NEED_GET_KEY: 'Please enter a key to get.',
	NEED_DEL_KEY: 'Please enter a key to delete.',
	INVALID_CAPACITY: max => `Capacity must be an integer between 1 and ${max}.`,

	// Put
	PUT_HIT: (key, val) => `Cache Hit on key "${key}" — updating value to "${val}".`,
	PUT_EVICT: (cap, key) => `Cache full (${cap}/${cap}) — evicting LRU key "${key}".`,
	PUT_INSERT: (key, val) => `Inserting "${key}" → "${val}" into Cache and DLL at MRU position.`,
	PUT_COMPLETE: (key, val) => `put("${key}", "${val}") complete.`,

	// Get
	GET_MISS: key => `Cache Miss: key "${key}" not found in Cache — returning -1.`,
	GET_HIT: key => `Cache Hit! Key "${key}" located in Cache (O(1)) → pointing to DLL node.`,
	GET_COMPLETE: (key, val) => `get("${key}") → "${val}".`,

	// Delete
	DEL_MISS: key => `Key "${key}" not in Cache — nothing to delete.`,
	DEL_FOUND: key => `Deleting key "${key}" from Cache and DLL.`,
	DEL_COMPLETE: key => `delete("${key}") complete.`,

	// Navigation & Inspection
	MOVE_TO_MRU: key => `Moving "${key}" to MRU position.`,
	INSPECT: (key, val, pos) =>
		`Inspecting: key "${key}" maps to DLL node "${key}" (value: "${val}") at ${pos}.`,
};

// ─── LRU class ───────────────────────────────────────────────────────────────

export default class LRU extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.inspectedKey = null;
		this.listenersAttached = false;
		this.setup();
	}

	// ── Control bar ────────────────────────────────────────────────────────────

	addControls() {
		this.controls = [];

		// Put: Key / Value (two-row group)
		const putVG = addGroupToAlgorithmBar(false);
		const putTop = addGroupToAlgorithmBar(true, putVG);
		const putBot = addGroupToAlgorithmBar(true, putVG);

		addLabelToAlgorithmBar('Key:', putTop);
		this.putKeyField = addControlToAlgorithmBar('Text', '', putTop);
		this.putKeyField.size = MAX_KEY_LENGTH;
		this.putKeyField.onkeydown = this.returnSubmit(
			this.putKeyField,
			this.putCallback.bind(this),
			MAX_KEY_LENGTH,
			false,
		);
		this.controls.push(this.putKeyField);

		addLabelToAlgorithmBar('Value:', putBot);
		this.putValField = addControlToAlgorithmBar('Text', '', putBot);
		this.putValField.size = MAX_VAL_LENGTH;
		this.putValField.onkeydown = this.returnSubmit(
			this.putValField,
			this.putCallback.bind(this),
			MAX_VAL_LENGTH,
			false,
		);
		this.controls.push(this.putValField);

		this.putButton = addControlToAlgorithmBar('Button', 'Put');
		this.putButton.onclick = this.putCallback.bind(this);
		this.controls.push(this.putButton);

		addDivisorToAlgorithmBar();

		// Get
		const getG = addGroupToAlgorithmBar(true);
		addLabelToAlgorithmBar('Key:', getG);
		this.getKeyField = addControlToAlgorithmBar('Text', '', getG);
		this.getKeyField.size = MAX_KEY_LENGTH;
		this.getKeyField.onkeydown = this.returnSubmit(
			this.getKeyField,
			this.getCallback.bind(this),
			MAX_KEY_LENGTH,
			false,
		);
		this.controls.push(this.getKeyField);

		this.getButton = addControlToAlgorithmBar('Button', 'Get');
		this.getButton.onclick = this.getCallback.bind(this);
		this.controls.push(this.getButton);

		addDivisorToAlgorithmBar();

		// Delete
		const delG = addGroupToAlgorithmBar(true);
		addLabelToAlgorithmBar('Key:', delG);
		this.deleteKeyField = addControlToAlgorithmBar('Text', '', delG);
		this.deleteKeyField.size = MAX_KEY_LENGTH;
		this.deleteKeyField.onkeydown = this.returnSubmit(
			this.deleteKeyField,
			this.deleteCallback.bind(this),
			MAX_KEY_LENGTH,
			false,
		);
		this.controls.push(this.deleteKeyField);

		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);
		this.controls.push(this.deleteButton);

		addDivisorToAlgorithmBar();

		// Capacity + Restart
		const capVG = addGroupToAlgorithmBar(false);
		const capTop = addGroupToAlgorithmBar(true, capVG);
		const capBot = addGroupToAlgorithmBar(true, capVG);

		addLabelToAlgorithmBar('Capacity:', capTop);
		this.capacityField = addControlToAlgorithmBar('Text', String(DEFAULT_CAPACITY), capTop);
		this.capacityField.size = 3;
		this.capacityField.onkeydown = this.returnSubmit(
			this.capacityField,
			this.restartCallback.bind(this),
			2,
			true,
		);
		this.controls.push(this.capacityField);

		this.restartButton = addControlToAlgorithmBar('Button', 'Restart', capBot);
		this.restartButton.onclick = this.restartCallback.bind(this);
		this.controls.push(this.restartButton);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	// ── Setup ──────────────────────────────────────────────────────────────────

	setup() {
		// JS-side state
		this.capacity = DEFAULT_CAPACITY;
		// O(1) lookup map: key → { keyCellID, ptrCellID, nodeID, valLabelID }
		this.map = Object.create(null);
		// Active keys in the Hash Map
		this.mapKeys = [];
		// Ordered MRU→LRU: [{ key, value, nodeID, valLabelID }]
		this.dll = [];
		// Tracked DLL connections
		this.dllConnections = [];

		// ── Permanent canvas objects ───────────────────────────────────────────

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		// Capacity counter text
		this.capLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.capLabelID, this.capText(), CAP_LABEL_X, CAP_LABEL_Y, 0);

		// Cache section title & column headers
		this.mapTitleID = this.nextIndex++;
		this.cmd(act.createLabel, this.mapTitleID, 'Cache', MAP_TITLE_X, MAP_TITLE_Y, 0);
		this.cmd(act.setForegroundColor, this.mapTitleID, '#1976D2');

		this.mapColKeyID = this.nextIndex++;
		this.cmd(act.createLabel, this.mapColKeyID, 'Key', MAP_COL_KEY_X, MAP_COL_HEADER_Y, 1);
		this.cmd(act.setForegroundColor, this.mapColKeyID, '#666666');

		this.mapColRefID = this.nextIndex++;
		this.cmd(act.createLabel, this.mapColRefID, 'Node Ref', MAP_COL_REF_X, MAP_COL_HEADER_Y, 1);
		this.cmd(act.setForegroundColor, this.mapColRefID, '#666666');

		// "val:" label sits to the left of the value row
		this.valHeaderID = this.nextIndex++;
		this.cmd(
			act.createLabel,
			this.valHeaderID,
			'val:',
			DLL_START_X - 45,
			DLL_START_Y + VAL_OFFSET_Y,
			0,
		);
		this.cmd(act.setForegroundColor, this.valHeaderID, '#888888');

		// MRU badge — colored rectangle + text
		this.mruBadgeID = this.nextIndex++;
		this.mruTextID = this.nextIndex++;
		this.cmd(act.createRectangle, this.mruBadgeID, '', BADGE_W, BADGE_H, OFFSCREEN, OFFSCREEN);
		this.cmd(act.setBackgroundColor, this.mruBadgeID, MRU_COLOR);
		this.cmd(act.setForegroundColor, this.mruBadgeID, MRU_COLOR);
		this.cmd(act.createLabel, this.mruTextID, '', OFFSCREEN, OFFSCREEN, 1);
		this.cmd(act.setForegroundColor, this.mruTextID, WHITE);

		// LRU badge — colored rectangle + text
		this.lruBadgeID = this.nextIndex++;
		this.lruTextID = this.nextIndex++;
		this.cmd(act.createRectangle, this.lruBadgeID, '', BADGE_W, BADGE_H, OFFSCREEN, OFFSCREEN);
		this.cmd(act.setBackgroundColor, this.lruBadgeID, LRU_COLOR);
		this.cmd(act.setForegroundColor, this.lruBadgeID, LRU_COLOR);
		this.cmd(act.createLabel, this.lruTextID, '', OFFSCREEN, OFFSCREEN, 1);
		this.cmd(act.setForegroundColor, this.lruTextID, WHITE);

		this.pseudocode = pseudocodeText.LRU;

		// Store nextIndex after setup so reset() can restore it
		this.resetIndex = this.nextIndex;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.commands = [];

		// Attach canvas event listeners for interactive Click-to-Inspect
		this.canvas = document.getElementById('canvas');
		if (this.canvas && !this.listenersAttached) {
			this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
			this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
			this.listenersAttached = true;
		}
	}

	reset() {
		this.map = Object.create(null);
		this.mapKeys = [];
		this.dll = [];
		this.dllConnections = [];
		this.inspectedKey = null;
		this.nextIndex = this.resetIndex;
	}

	// ── Interactive Click-to-Inspect ───────────────────────────────────────────

	getCanvasCoords(event) {
		if (!this.canvas) return { x: -1, y: -1 };
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		return {
			x: (event.clientX - rect.left) * scaleX,
			y: (event.clientY - rect.top) * scaleY,
		};
	}

	findHitRow(x, y) {
		for (let i = 0; i < this.mapKeys.length; i++) {
			const rowY = this.mapRowY(i);
			const left = MAP_COL_KEY_X - MAP_KEY_W / 2;
			const right = MAP_COL_REF_X + MAP_REF_W / 2;
			const top = rowY - MAP_ROW_H / 2;
			const bottom = rowY + MAP_ROW_H / 2;
			if (x >= left && x <= right && y >= top && y <= bottom) {
				return i;
			}
		}
		return -1;
	}

	handleCanvasMouseMove(event) {
		if (!this.canvas) return;
		const { x, y } = this.getCanvasCoords(event);
		const hit = this.findHitRow(x, y);
		this.canvas.style.cursor = hit !== -1 ? 'pointer' : 'default';
	}

	handleCanvasClick(event) {
		if (this.animationManager && this.animationManager.currentlyAnimating) return;
		const { x, y } = this.getCanvasCoords(event);
		const hitRow = this.findHitRow(x, y);

		if (hitRow === -1) {
			if (this.inspectedKey) this.clearInspection();
			return;
		}

		const key = this.mapKeys[hitRow];
		if (this.inspectedKey === key) {
			this.clearInspection();
		} else {
			this.inspectKey(key);
		}
	}

	inspectKey(key) {
		this.clearInspection();
		const mapEntry = this.map[key];
		const dllIdx = this.dll.findIndex(n => n.key === key);
		if (!mapEntry || dllIdx === -1) return;

		const targetNode = this.dll[dllIdx];
		this.inspectedKey = key;
		this.commands = [];

		this.cmd(act.setBackgroundColor, mapEntry.keyCellID, PTR_CELL_BG);
		this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, '#BBDEFB');
		this.cmd(act.setBackgroundColor, targetNode.nodeID, '#E1F5FE');
		this.cmd(
			act.connect,
			mapEntry.ptrCellID,
			targetNode.nodeID,
			MAP_LINK_COLOR,
			0.0,
			true,
			'',
			0,
		);

		const posDesc =
			dllIdx === 0
				? 'index 0 (MRU)'
				: dllIdx === this.dll.length - 1
				? `index ${dllIdx} (LRU)`
				: `index ${dllIdx}`;
		this.setStatus(STATUS.INSPECT(key, targetNode.value, posDesc));

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.commands = [];
	}

	clearInspection() {
		if (!this.inspectedKey) return;
		const key = this.inspectedKey;
		const mapEntry = this.map[key];
		const dllIdx = this.dll.findIndex(n => n.key === key);
		this.inspectedKey = null;

		this.commands = [];
		if (mapEntry) {
			this.cmd(act.setBackgroundColor, mapEntry.keyCellID, KEY_CELL_BG);
			this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, PTR_CELL_BG);
			if (dllIdx !== -1) {
				this.cmd(act.disconnect, mapEntry.ptrCellID, this.dll[dllIdx].nodeID);
				this.cmd(act.setBackgroundColor, this.dll[dllIdx].nodeID, WHITE);
			}
		}
		this.setStatus('');
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.commands = [];
	}

	// ── UI lifecycle ───────────────────────────────────────────────────────────

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	// ── Helpers ────────────────────────────────────────────────────────────────

	setStatus(text) {
		this.cmd(act.setText, this.infoLabelID, text);
	}

	capText() {
		return `Capacity: ${this.dll ? this.dll.length : 0} / ${this.capacity}`;
	}

	dllNodeX(idx) {
		return DLL_START_X + idx * DLL_X_GAP;
	}

	mapRowY(idx) {
		return MAP_START_Y + idx * MAP_ROW_GAP;
	}

	// ── Callbacks ──────────────────────────────────────────────────────────────

	putCallback() {
		this.clearInspection();
		const key = this.putKeyField.value.trim();
		const val = this.putValField.value.trim();
		if (key === '' || val === '') {
			this.implementAction(this.setStatusCmd.bind(this), STATUS.NEED_KEY_VALUE);
			this.shake(this.putButton);
			return;
		}
		if (FORBIDDEN_KEYS.has(key)) {
			this.implementAction(this.setStatusCmd.bind(this), STATUS.FORBIDDEN_KEY(key));
			this.shake(this.putButton);
			return;
		}
		this.putKeyField.value = '';
		this.putValField.value = '';
		this.implementAction(this.animatePut.bind(this), key, val);
	}

	getCallback() {
		this.clearInspection();
		const key = this.getKeyField.value.trim();
		if (key === '') {
			this.implementAction(this.setStatusCmd.bind(this), STATUS.NEED_GET_KEY);
			this.shake(this.getButton);
			return;
		}
		this.getKeyField.value = '';
		this.implementAction(this.animateGet.bind(this), key);
	}

	deleteCallback() {
		this.clearInspection();
		const key = this.deleteKeyField.value.trim();
		if (key === '') {
			this.implementAction(this.setStatusCmd.bind(this), STATUS.NEED_DEL_KEY);
			this.shake(this.deleteButton);
			return;
		}
		this.deleteKeyField.value = '';
		this.implementAction(this.animateDelete.bind(this), key);
	}

	restartCallback() {
		this.clearInspection();
		const raw = parseInt(this.capacityField.value, 10);
		// Enforce capacity between 1 and MAX_CAPACITY (explicitly disallow 0 or negative)
		if (isNaN(raw) || raw < 1 || raw > MAX_CAPACITY) {
			this.implementAction(
				this.setStatusCmd.bind(this),
				STATUS.INVALID_CAPACITY(MAX_CAPACITY),
			);
			this.shake(this.restartButton);
			return;
		}
		this.capacity = raw;
		this.implementAction(this.clearAll.bind(this));
	}

	clearCallback() {
		this.clearInspection();
		this.implementAction(this.clearAll.bind(this));
	}

	setStatusCmd(text) {
		this.commands = [];
		this.setStatus(text);
		return this.commands;
	}

	// ── Animation: put ────────────────────────────────────────────────────────

	animatePut(key, value) {
		this.commands = [];
		this.setStatus('');
		this.highlight(0, 0, 'put');
		this.cmd(act.step);

		if (key in this.map) {
			// ── Key exists: update in map and move DLL node to head (MRU) ───
			this.highlight(1, 0, 'put');
			this.cmd(act.step);

			const mapEntry = this.map[key];
			const dllIdx = this.dll.findIndex(n => n.key === key);
			const targetNodeID = this.dll[dllIdx].nodeID;

			// Highlight Hash Map row & DLL node and draw active focused lookup pointer
			this.cmd(act.setBackgroundColor, mapEntry.keyCellID, HIGHLIGHT_COLOR);
			this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, HIGHLIGHT_COLOR);
			this.cmd(act.setBackgroundColor, targetNodeID, HIGHLIGHT_COLOR);
			this.cmd(
				act.connect,
				mapEntry.ptrCellID,
				targetNodeID,
				MAP_LINK_COLOR,
				0.0,
				true,
				'',
				0,
			);

			this.highlight(2, 0, 'put');
			this.setStatus(STATUS.PUT_HIT(key, value));
			this.cmd(act.step);

			// Update value
			this.dll[dllIdx].value = value;
			this.cmd(act.setText, this.dll[dllIdx].valLabelID, value);
			this.highlight(3, 0, 'put');
			this.cmd(act.step);

			// Move to head (MRU)
			this.highlight(4, 0, 'put');
			this.setStatus(STATUS.MOVE_TO_MRU(key));
			this.moveToHead(dllIdx);
			this.cmd(act.step);

			// Reset colors & remove active pointer arrow
			this.cmd(act.disconnect, mapEntry.ptrCellID, targetNodeID);
			this.cmd(act.setBackgroundColor, mapEntry.keyCellID, KEY_CELL_BG);
			this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, PTR_CELL_BG);
			this.cmd(act.setBackgroundColor, targetNodeID, WHITE);
		} else {
			// ── Key is new ───────────────────────────────────────────────────
			this.highlight(5, 0, 'put');
			this.cmd(act.step);

			// Evict LRU if at capacity
			if (this.dll.length >= this.capacity) {
				this.highlight(9, 0, 'put');
				this.cmd(act.step);

				const tail = this.dll[this.dll.length - 1];
				const tailMap = this.map[tail.key];

				this.cmd(act.setBackgroundColor, tail.nodeID, EVICT_COLOR);
				if (tailMap) {
					this.cmd(act.setBackgroundColor, tailMap.keyCellID, EVICT_COLOR);
					this.cmd(act.setBackgroundColor, tailMap.ptrCellID, EVICT_COLOR);
					this.cmd(
						act.connect,
						tailMap.ptrCellID,
						tail.nodeID,
						EVICT_COLOR,
						0.0,
						true,
						'',
						0,
					);
				}
				this.setStatus(STATUS.PUT_EVICT(this.capacity, tail.key));
				this.highlight(10, 0, 'put');
				this.cmd(act.step);

				if (tailMap) {
					this.cmd(act.disconnect, tailMap.ptrCellID, tail.nodeID);
				}
				this.evictLRU();
				this.highlight(11, 0, 'put');
				this.highlight(12, 0, 'put');
				this.cmd(act.step);
			}

			this.highlight(6, 0, 'put');
			this.setStatus(STATUS.PUT_INSERT(key, value));
			this.insertHead(key, value);
			this.highlight(7, 0, 'put');
			this.highlight(8, 0, 'put');
			this.cmd(act.step);
		}

		this.unhighlightAll('put');
		this.redrawMapAndDLL();
		this.setStatus(STATUS.PUT_COMPLETE(key, value));
		return this.commands;
	}

	// ── Animation: get ────────────────────────────────────────────────────────

	animateGet(key) {
		this.commands = [];
		this.setStatus('');
		this.highlight(0, 0, 'get');
		this.cmd(act.step);

		if (!(key in this.map)) {
			this.highlight(1, 0, 'get');
			this.setStatus(STATUS.GET_MISS(key));
			this.cmd(act.step);
			this.unhighlightAll('get');
			return this.commands;
		}

		this.highlight(2, 0, 'get');
		const mapEntry = this.map[key];
		const dllIdx = this.dll.findIndex(n => n.key === key);
		const targetNodeID = this.dll[dllIdx].nodeID;

		// Flash Hash Map row & DLL node in green with active focused lookup arrow
		this.cmd(act.setBackgroundColor, mapEntry.keyCellID, FOUND_COLOR);
		this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, FOUND_COLOR);
		this.cmd(act.setBackgroundColor, targetNodeID, FOUND_COLOR);
		this.cmd(act.connect, mapEntry.ptrCellID, targetNodeID, MAP_LINK_COLOR, 0.0, true, '', 0);

		this.setStatus(STATUS.GET_HIT(key));
		this.cmd(act.step);

		this.highlight(3, 0, 'get');
		this.setStatus(STATUS.MOVE_TO_MRU(key));
		this.moveToHead(dllIdx);
		this.cmd(act.step);

		// Disconnect active pointer and reset colors
		this.cmd(act.disconnect, mapEntry.ptrCellID, targetNodeID);
		this.cmd(act.setBackgroundColor, mapEntry.keyCellID, KEY_CELL_BG);
		this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, PTR_CELL_BG);
		this.cmd(act.setBackgroundColor, targetNodeID, WHITE);

		this.unhighlightAll('get');
		this.redrawMapAndDLL();
		this.setStatus(STATUS.GET_COMPLETE(key, this.dll[0].value));
		return this.commands;
	}

	// ── Animation: delete ─────────────────────────────────────────────────────

	animateDelete(key) {
		this.commands = [];
		this.setStatus('');
		this.highlight(0, 0, 'delete');
		this.cmd(act.step);

		if (!(key in this.map)) {
			this.highlight(1, 0, 'delete');
			this.setStatus(STATUS.DEL_MISS(key));
			this.cmd(act.step);
			this.unhighlightAll('delete');
			return this.commands;
		}

		this.highlight(2, 0, 'delete');
		const mapEntry = this.map[key];
		const dllIdx = this.dll.findIndex(n => n.key === key);
		const targetNodeID = this.dll[dllIdx].nodeID;

		this.cmd(act.setBackgroundColor, mapEntry.keyCellID, EVICT_COLOR);
		this.cmd(act.setBackgroundColor, mapEntry.ptrCellID, EVICT_COLOR);
		this.cmd(act.setBackgroundColor, targetNodeID, EVICT_COLOR);
		this.cmd(act.connect, mapEntry.ptrCellID, targetNodeID, EVICT_COLOR, 0.0, true, '', 0);

		this.setStatus(STATUS.DEL_FOUND(key));
		this.cmd(act.step);

		this.cmd(act.disconnect, mapEntry.ptrCellID, targetNodeID);
		this.highlight(3, 0, 'delete');
		this.removeEntry(key);
		this.cmd(act.step);

		this.unhighlightAll('delete');
		this.redrawMapAndDLL();
		this.setStatus(STATUS.DEL_COMPLETE(key));
		return this.commands;
	}

	// ── Core internal mutations ───────────────────────────────────────────────

	insertHead(key, value) {
		const nodeID = this.nextIndex++;
		const valLabelID = this.nextIndex++;
		const keyCellID = this.nextIndex++;
		const ptrCellID = this.nextIndex++;

		const dllX = this.dllNodeX(0);
		const dropY = DLL_START_Y - 50;

		// 1. Create DLL node (authentic 3-compartment doubly linked list node)
		this.cmd(act.createDoublyLinkedListNode, nodeID, key, DLL_NODE_W, DLL_NODE_H, dllX, dropY);
		this.cmd(act.setPrevNull, nodeID, 1);
		this.cmd(act.setNextNull, nodeID, 1);
		this.cmd(act.createLabel, valLabelID, value, dllX, dropY + VAL_OFFSET_Y, 1);
		this.cmd(act.setForegroundColor, valLabelID, '#444444');

		// 2. Create Hash Map entry row
		const rowIdx = this.mapKeys.length;
		const mapY = this.mapRowY(rowIdx);

		this.cmd(act.createRectangle, keyCellID, key, MAP_KEY_W, MAP_ROW_H, MAP_COL_KEY_X, mapY);
		this.cmd(act.setBackgroundColor, keyCellID, KEY_CELL_BG);
		this.cmd(act.setForegroundColor, keyCellID, CELL_BORDER);

		this.cmd(act.createRectangle, ptrCellID, '•', MAP_REF_W, MAP_ROW_H, MAP_COL_REF_X, mapY);
		this.cmd(act.setBackgroundColor, ptrCellID, PTR_CELL_BG);
		this.cmd(act.setForegroundColor, ptrCellID, CELL_BORDER);
		this.cmd(act.setTextColor, ptrCellID, MAP_LINK_COLOR);

		// 3. Connect active pointer during insertion step
		this.cmd(act.connect, ptrCellID, nodeID, MAP_LINK_COLOR, 0.0, true, '', 0);

		// Flash gold to emphasize insertion
		this.cmd(act.setBackgroundColor, nodeID, HIGHLIGHT_COLOR);
		this.cmd(act.setBackgroundColor, keyCellID, HIGHLIGHT_COLOR);
		this.cmd(act.setBackgroundColor, ptrCellID, HIGHLIGHT_COLOR);
		this.cmd(act.step);

		// Disconnect active pointer and reset colors back to standard
		this.cmd(act.disconnect, ptrCellID, nodeID);
		this.cmd(act.setBackgroundColor, nodeID, WHITE);
		this.cmd(act.setBackgroundColor, keyCellID, KEY_CELL_BG);
		this.cmd(act.setBackgroundColor, ptrCellID, PTR_CELL_BG);

		// Record in state
		this.map[key] = { keyCellID, ptrCellID, nodeID, valLabelID };
		this.mapKeys.push(key);
		this.dll.unshift({ key, value, nodeID, valLabelID });
	}

	moveToHead(srcIdx) {
		if (srcIdx === 0) return;
		const node = this.dll.splice(srcIdx, 1)[0];
		this.dll.unshift(node);
	}

	evictLRU() {
		if (this.dll.length === 0) return;
		const tail = this.dll[this.dll.length - 1];
		this.removeEntry(tail.key);
	}

	removeEntry(key) {
		const mapEntry = this.map[key];
		const dllIdx = this.dll.findIndex(n => n.key === key);

		if (mapEntry) {
			this.cmd(act.delete, mapEntry.keyCellID);
			this.cmd(act.delete, mapEntry.ptrCellID);
			delete this.map[key];
			this.mapKeys = this.mapKeys.filter(k => k !== key);
		}

		if (dllIdx !== -1) {
			const node = this.dll[dllIdx];
			this.cmd(act.delete, node.nodeID);
			this.cmd(act.delete, node.valLabelID);
			this.dll.splice(dllIdx, 1);
		}
	}

	// ── Redraw & layout synchronization ────────────────────────────────────────

	redrawMapAndDLL() {
		// 1. Clear previous DLL connections
		for (const conn of this.dllConnections) {
			this.cmd(act.disconnect, conn.from, conn.to);
		}
		this.dllConnections = [];

		// 2. Reposition DLL nodes and value labels
		for (let i = 0; i < this.dll.length; i++) {
			const x = this.dllNodeX(i);
			this.cmd(act.move, this.dll[i].nodeID, x, DLL_START_Y);
			this.cmd(act.move, this.dll[i].valLabelID, x, DLL_START_Y + VAL_OFFSET_Y);
		}

		// 3. Set DLL null pointers and bi-directional edges
		for (let i = 0; i < this.dll.length; i++) {
			this.cmd(act.setPrevNull, this.dll[i].nodeID, i === 0 ? 1 : 0);
			this.cmd(act.setNextNull, this.dll[i].nodeID, i === this.dll.length - 1 ? 1 : 0);
		}
		for (let i = 0; i < this.dll.length - 1; i++) {
			const from = this.dll[i].nodeID;
			const to = this.dll[i + 1].nodeID;
			this.cmd(act.connectNext, from, to);
			this.dllConnections.push({ from, to });
			this.cmd(act.connectPrev, to, from);
			this.dllConnections.push({ from: to, to: from });
		}

		// 4. Reposition Hash Map rows cleanly
		for (let i = 0; i < this.mapKeys.length; i++) {
			const k = this.mapKeys[i];
			const entry = this.map[k];
			if (entry) {
				const rowY = this.mapRowY(i);
				this.cmd(act.move, entry.keyCellID, MAP_COL_KEY_X, rowY);
				this.cmd(act.move, entry.ptrCellID, MAP_COL_REF_X, rowY);
			}
		}

		// 5. Update MRU / LRU Badges with comfortable vertical clearance above nodes
		if (this.dll.length === 0) {
			// Hide badges offscreen
			this.cmd(act.move, this.mruBadgeID, OFFSCREEN, OFFSCREEN);
			this.cmd(act.move, this.mruTextID, OFFSCREEN, OFFSCREEN);
			this.cmd(act.move, this.lruBadgeID, OFFSCREEN, OFFSCREEN);
			this.cmd(act.move, this.lruTextID, OFFSCREEN, OFFSCREEN);
		} else if (this.dll.length === 1) {
			// Capacity = 1 / Size = 1 edge case: single combined badge
			const x = this.dllNodeX(0);
			this.cmd(act.setText, this.mruTextID, 'MRU / LRU');
			this.cmd(act.setWidth, this.mruBadgeID, 72);
			this.cmd(act.setBackgroundColor, this.mruBadgeID, COMBO_BADGE_COLOR);
			this.cmd(act.setForegroundColor, this.mruBadgeID, COMBO_BADGE_COLOR);
			this.cmd(act.move, this.mruBadgeID, x, BADGE_Y);
			this.cmd(act.move, this.mruTextID, x, BADGE_Y);

			// Hide secondary LRU badge
			this.cmd(act.move, this.lruBadgeID, OFFSCREEN, OFFSCREEN);
			this.cmd(act.move, this.lruTextID, OFFSCREEN, OFFSCREEN);
		} else {
			// Size > 1: separate MRU and LRU badges
			const mruX = this.dllNodeX(0);
			const lruX = this.dllNodeX(this.dll.length - 1);

			this.cmd(act.setText, this.mruTextID, 'MRU');
			this.cmd(act.setWidth, this.mruBadgeID, BADGE_W);
			this.cmd(act.setBackgroundColor, this.mruBadgeID, MRU_COLOR);
			this.cmd(act.setForegroundColor, this.mruBadgeID, MRU_COLOR);
			this.cmd(act.move, this.mruBadgeID, mruX, BADGE_Y);
			this.cmd(act.move, this.mruTextID, mruX, BADGE_Y);

			this.cmd(act.setText, this.lruTextID, 'LRU');
			this.cmd(act.setWidth, this.lruBadgeID, BADGE_W);
			this.cmd(act.setBackgroundColor, this.lruBadgeID, LRU_COLOR);
			this.cmd(act.setForegroundColor, this.lruBadgeID, LRU_COLOR);
			this.cmd(act.move, this.lruBadgeID, lruX, BADGE_Y);
			this.cmd(act.move, this.lruTextID, lruX, BADGE_Y);
		}

		// 6. Update capacity counter
		this.cmd(act.setText, this.capLabelID, this.capText());
		this.cmd(act.step);
	}

	unhighlightAll(op) {
		const lines = (this.pseudocode && this.pseudocode[op] && this.pseudocode[op].code) || [];
		for (let i = 0; i < lines.length; i++) {
			this.unhighlight(i, 0, op);
		}
	}

	// ── Clear / reset ──────────────────────────────────────────────────────────

	clearAll() {
		this.commands = [];
		this.setStatus('');

		this.dllConnections = [];

		// Destroy all DLL nodes and their value labels
		for (let i = 0; i < this.dll.length; i++) {
			this.cmd(act.delete, this.dll[i].nodeID);
			this.cmd(act.delete, this.dll[i].valLabelID);
		}
		this.dll = [];

		// Destroy all Hash Map rows
		for (const k of this.mapKeys) {
			const entry = this.map[k];
			if (entry) {
				this.cmd(act.delete, entry.keyCellID);
				this.cmd(act.delete, entry.ptrCellID);
			}
		}
		this.map = Object.create(null);
		this.mapKeys = [];
		this.inspectedKey = null;

		// Hide badges
		this.cmd(act.move, this.mruBadgeID, OFFSCREEN, OFFSCREEN);
		this.cmd(act.move, this.mruTextID, OFFSCREEN, OFFSCREEN);
		this.cmd(act.move, this.lruBadgeID, OFFSCREEN, OFFSCREEN);
		this.cmd(act.move, this.lruTextID, OFFSCREEN, OFFSCREEN);

		// Reset capacity counter
		this.cmd(act.setText, this.capLabelID, this.capText());

		return this.commands;
	}
}
