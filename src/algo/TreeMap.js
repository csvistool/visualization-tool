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
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
    addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';

import Hash from './Hash.js';

import { act } from '../anim/AnimationMain';

const POINTER_ARRAY_ELEM_WIDTH = 150;
const POINTER_ARRAY_ELEM_HEIGHT = 25;
const POINTER_ARRAY_ELEM_START_X = 250;
const POINTER_ARRAY_ELEM_START_Y = 100;

const EXPLAIN_LABEL_X = 550;
const EXPLAIN_LABEL_Y = 15;

const HASH_TABLE_SIZE = 7;

const DEFAULT_LOAD_FACTOR = 0.67;

const LOAD_LABEL_X = 15;
const LOAD_LABEL_Y = 15;

const MAX_SIZE = 30;

const INDEX_COLOR = '#0000FF';

export default class TreeMap extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.nextIndex = 0;
		this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
		this.setup();
	}

	addControls() {
		super.addControls();
		this.restartButton.onclick = this.resizeInitialTableCall.bind(this);

		this.hashTypeLabel = addLabelToAlgorithmBar('Hash Type:', this.dropDownLabelGroup);
		this.hashTypeDropDown = addDropDownGroupToAlgorithmBar(
			[
				['Integers', 'Hash Integers'],
				['Strings', 'Hash Strings'],
				['True', 'True Hash Function'],
			],
			'Hash Type',
			this.dropDownParentGroup,
		);

		this.hashTypeDropDown.onchange = this.checkHashType.bind(this);

		this.hashType = 'integers';

        addDivisorToAlgorithmBar();

        const predSuccButtonList = addRadioButtonGroupToAlgorithmBar(
			['Predecessor', 'Successor'],
			'Predecessor/Successor',
		);

		this.predButton = predSuccButtonList[0];
		this.succButton = predSuccButtonList[1];
		this.predButton.onclick = () => (this.predSucc = 'pred');
		this.succButton.onclick = () => (this.predSucc = 'succ');
		this.succButton.checked = true;
		this.predSucc = 'succ';

        addDivisorToAlgorithmBar();

		this.randomGroup = addGroupToAlgorithmBar(false);

		// Random data button
		this.randomButton = addControlToAlgorithmBar('Button', 'Random', this.randomGroup);
		this.randomButton.onclick = this.randomCallback.bind(this);
		this.controls.push(this.randomButton);
	}

	setup() {
		this.initialCapacityField.value = HASH_TABLE_SIZE;
		this.hashTableVisual = new Array(HASH_TABLE_SIZE);
		this.hashTableIndices = new Array(HASH_TABLE_SIZE);
		this.hashTableValues = new Array(HASH_TABLE_SIZE);
		this.indexXPos = new Array(HASH_TABLE_SIZE);
		this.indexYPos = new Array(HASH_TABLE_SIZE);

        this.edges = []

		this.ExplainLabel = this.nextIndex++;

		this.loadFactorID = this.nextIndex++;

		this.size = 0;

		this.table_size = HASH_TABLE_SIZE;

		this.load_factor = DEFAULT_LOAD_FACTOR;

		this.resetIndex = this.nextIndex;

		this.commands = [];
		for (let i = 0; i < HASH_TABLE_SIZE; i++) {
			let nextID = this.nextIndex++;

			this.cmd(
				act.createRectangle,
				nextID,
				'',
				POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_HEIGHT,
				POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_START_Y,
			);
			this.hashTableVisual[i] = nextID;
			this.cmd(act.setNull, this.hashTableVisual[i], 1);

			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;
			this.hashTableValues[i] = null;

			this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = POINTER_ARRAY_ELEM_START_Y - POINTER_ARRAY_ELEM_HEIGHT;

			this.cmd(act.createLabel, nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, nextID, INDEX_COLOR);
		}
		this.cmd(
			act.createLabel,
			this.loadFactorID,
			`Load Factor: ${this.load_factor}`,
			LOAD_LABEL_X,
			LOAD_LABEL_Y,
			false,
		);
		this.cmd(act.createLabel, this.ExplainLabel, '', EXPLAIN_LABEL_X, EXPLAIN_LABEL_Y, 0);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	resizeInitialTableCall() {
		this.implementAction(this.resizeInitialTable.bind(this));
	}

	resizeInitialTable() {
		// Make command stack empty, and clear the elements of the list.
		this.commands = [];
		this.resetAll();
		//Delete current hashTable
		this.oldHashTableVisual = this.hashTableVisual;
		this.oldHashTableIndices = this.hashTableIndices;
		for (let i = 0; i < this.table_size; i++) {
			this.cmd(act.setNull, this.oldHashTableVisual[i], 1);
			this.cmd(act.delete, this.oldHashTableVisual[i]);
			this.cmd(act.delete, this.oldHashTableIndices[i]);
		}

		if (this.initialCapacityField !== '') {
			this.table_size = parseInt(this.initialCapacityField.value)
				? Math.min(Math.max(0, parseInt(this.initialCapacityField.value)), MAX_SIZE)
				: HASH_TABLE_SIZE;
		}

		if (this.table_size * 2 + 1 > MAX_SIZE) {
			this.load_factor = 0.99;
			this.cmd(
				act.setText,
				this.loadFactorID,
				`Load Factor: ${this.load_factor}\n(Array length too large for resize)`,
			);
			this.cmd(act.step);
		} else {
			this.load_factor = DEFAULT_LOAD_FACTOR;
			this.cmd(act.step);
		}
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableIndices = new Array(this.table_size);
		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);

		for (let i = 0; i < this.table_size; i++) {
			let nextID = this.nextIndex++;

			this.cmd(
				act.createRectangle,
				nextID,
				'',
				POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_HEIGHT,
				POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_START_Y,
			);
			this.hashTableVisual[i] = nextID;
			this.cmd(act.setNull, this.hashTableVisual[i], 1);

			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;

			this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X - POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT;

			this.cmd(act.createLabel, nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, nextID, INDEX_COLOR);
		}

		if (this.size !== 0) {
			for (let i = 0; i < this.hashTableValues.length; i++) {
				let node = this.hashTableValues[i];
				if (node != null) {
					this.cmd(act.delete, node.graphicID);
					while (node.next != null) {
						node = node.next;
						this.cmd(act.delete, node.graphicID);
					}
				}
			}

			this.hashTableValues = new Array(HASH_TABLE_SIZE);
			this.size = 0;
		}

		return this.commands;
	}

    compare(a, b) {
		const numA = parseInt(a);
		const numB = parseInt(b);

		const isNumA = !isNaN(numA);
		const isNumB = !isNaN(numB);

		if (isNumA && isNumB) {
			return numA - numB;
		} else if (!isNumA && !isNumB) {
			return a.localeCompare(b);
		} else {
			return isNumA ? -1 : 1;
		}
	}

    insertElement(key, value) {
		const elem = `<${key}, ${value}>`;
		this.commands = [];

		this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);

		if (
			(this.size + 1) / this.table_size > this.load_factor &&
			this.table_size * 2 + 1 < MAX_SIZE
		) {
			this.resize();
		}

		this.cmd(act.setText, this.ExplainLabel, 'Inserting element ' + elem);

		const index = this.doHash(key);

        if (this.hashTableValues[index] != null) {
            this.cmd(act.setText, this.ExplainLabel, 'Searching for duplicates of ' + key);
        } else {
            this.cmd(act.setText, this.ExplainLabel, 'Creating New Tree');
        }
        this.cmd(act.step);

        this.hashTableValues[index] = this.addH(elem, key, value, index, this.hashTableValues[index]);
		this.resizeTree(index);

        this.cmd(act.setText, this.ExplainLabel, '');
		return this.commands;
	}

    addH(elem, key, value, index, curr) {
		if (curr == null) {
            this.size++;
            const treeNodeID = this.nextIndex++;
            const heightLabelID = this.nextIndex++;
            const bfLabelID = this.nextIndex++;
            this.cmd(act.createCircle, treeNodeID, elem, 30, TreeMap.STARTING_Y);
    
            this.cmd(act.setForegroundColor, treeNodeID, TreeMap.FOREGROUND_COLOR);
            this.cmd(act.setBackgroundColor, treeNodeID, TreeMap.BACKGROUND_COLOR);
            this.cmd(act.createLabel, heightLabelID, 0, 30 - 20, TreeMap.STARTING_Y - 20);
            this.cmd(act.setForegroundColor, heightLabelID, TreeMap.HEIGHT_LABEL_COLOR);
    
            this.cmd(act.createLabel, bfLabelID, 0, 30 + 20, TreeMap.STARTING_Y - 20);
            this.cmd(act.setForegroundColor, bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
            this.cmd(act.step);
            this.cmd(act.setText, this.ExplainLabel, '');
            return new AVLNode(elem, key, value, treeNodeID, heightLabelID, bfLabelID, 0, 0);
		}
		this.cmd(act.setHighlight, curr.graphicID, 1);
        if (this.compare(key, curr.key) < 0) {
			this.cmd(act.setText, this.ExplainLabel, `${key} < ${curr.key}. Looking at left subtree`);
			this.cmd(act.step);
			curr.left = this.addH(elem, key, value, index, curr.left);
			curr.left.parent = curr;
			this.resizeTree(index);
			const connected = this.connectSmart(curr.graphicID, curr.left.graphicID);
			connected && this.cmd(act.step);
        } else if (this.compare(key, curr.key) > 0){
			this.cmd(act.setText, this.ExplainLabel, `${key} > ${curr.key}. Looking at right subtree`);
			this.cmd(act.step);
			curr.right = this.addH(elem, key, value, index, curr.right);
			curr.right.parent = curr;
			this.resizeTree(index);
			const connected = this.connectSmart(curr.graphicID, curr.right.graphicID);
			connected && this.cmd(act.step);
		} else {
			this.cmd(act.setText, this.ExplainLabel, `${key} == ${curr.key}. Duplicate! Change value`);

            curr.value = value;
            curr.elem = `<${key}, ${value}>`
            this.cmd(act.setText, curr.graphicID, elem);
            this.cmd(act.step);

		}
		curr = this.balance(curr, index);
		this.cmd(act.setHighlight, curr.graphicID, 0);
        this.cmd(act.setText, this.ExplainLabel, '');
		return curr;
	}

    connectSmart(id1, id2) {
		if (!this.edges.some(e => e[0] === id1 && e[1] === id2)) {
			this.cmd(act.connect, id1, id2, TreeMap.LINK_COLOR);
			this.cmd(act.setEdgeAlpha, id1, id2, TreeMap.LINK_OPACITY);
			this.edges.push([id1, id2]);
			return true;
		}
		return false;
	}

	balance(curr, index) {
		curr.updateHeightAndBF();
		this.cmd(act.setText, curr.heightLabelID, curr.height);
		this.cmd(act.setText, curr.bfLabelID, curr.bf);
		this.cmd(act.setText, this.ExplainLabel, 'Adjusting height and balance factor after recursive call');
		this.cmd(act.step);

		if (curr.bf < -1) {
			this.cmd(act.setText, this.ExplainLabel, 'Balance factor < -1');
			this.cmd(act.setTextColor, curr.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
			this.cmd(act.step);
			if (curr.right != null && curr.right.bf > 0) {
				this.cmd(act.setText, this.ExplainLabel, 'Right child balance factor > 0');
				this.cmd(act.setTextColor, curr.right.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
				this.cmd(act.step);
				this.cmd(act.setText, this.ExplainLabel, 'Right-left rotation');
				this.cmd(act.step);
				this.cmd(act.setTextColor, curr.right.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
				curr.right = this.singleRotateRight(curr.right, index);
			} else {
				if (curr.right != null) {
					this.cmd(act.setText, this.ExplainLabel, 'Right child balance factor <= 0');
					this.cmd(act.setTextColor, curr.right.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
					this.cmd(act.step);
				} else {
					this.cmd(act.setText, this.ExplainLabel, 'No right child');
					this.cmd(act.step);
				}
				this.cmd(act.setText, this.ExplainLabel, 'Left rotation');
				this.cmd(act.step);
			}
			this.cmd(act.setTextColor, curr.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
			this.cmd(act.setTextColor, curr.right.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
			curr = this.singleRotateLeft(curr, index);
		} else if (curr.bf > 1) {
			this.cmd(act.setText, this.ExplainLabel, 'Balance factor > 1');
			this.cmd(act.setTextColor, curr.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
			this.cmd(act.step);
			if (curr.left != null && curr.left.bf < 0) {
				this.cmd(act.setText, this.ExplainLabel, 'Left child balance factor < 0');
				this.cmd(act.setTextColor, curr.left.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
				this.cmd(act.step);
				this.cmd(act.setText, this.ExplainLabel, 'Left-right rotation');
				this.cmd(act.step);
				this.cmd(act.setTextColor, curr.left.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
				curr.left = this.singleRotateLeft(curr.left, index);
			} else {
				if (curr.left != null) {
					this.cmd(act.setText, this.ExplainLabel, 'Left child balance factor >= 0');
					this.cmd(act.setTextColor, curr.left.bfLabelID, TreeMap.HIGHLIGHT_LABEL_COLOR);
					this.cmd(act.step);
				} else {
					this.cmd(act.setText, this.ExplainLabel, 'No left child');
					this.cmd(act.step);
				}
				this.cmd(act.setText, this.ExplainLabel, 'Right rotation');
				this.cmd(act.step);
				this.cmd(act.setTextColor, curr.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
			}
			this.cmd(act.setTextColor, curr.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
			this.cmd(act.setTextColor, curr.left.bfLabelID, TreeMap.HEIGHT_LABEL_COLOR);
			curr = this.singleRotateRight(curr, index);
		}
		return curr;
	}

	singleRotateRight(tree, index) {
		const B = tree;
		const A = tree.left;
		const t2 = A.right;

		// this.cmd(act.setText, 0, 'Single Rotate Right');
		this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 1);
		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, A.graphicID, t2.graphicID);
			this.cmd(act.connect, B.graphicID, t2.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.setEdgeAlpha, B.graphicID, t2.graphicID, TreeMap.LINK_OPACITY);
			t2.parent = B;
		}
		this.cmd(act.disconnect, B.graphicID, A.graphicID);
		this.cmd(act.connect, A.graphicID, B.graphicID, TreeMap.LINK_COLOR);
		this.cmd(act.setEdgeAlpha, A.graphicID, B.graphicID, TreeMap.LINK_OPACITY);
		A.parent = B.parent;
		if (this.hashTableValues[index] === B) {
			this.hashTableValues[index] = A;
		} else {
			this.cmd(act.disconnect, B.parent.graphicID, B.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.connect, B.parent.graphicID, A.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.setEdgeAlpha, B.parent.graphicID, A.graphicID, TreeMap.LINK_OPACITY);

			if (B.isLeftChild()) {
				B.parent.left = A;
			} else {
				B.parent.right = A;
			}
		}
		A.right = B;
		B.parent = A;
		B.left = t2;
		this.cmd(act.setHighlight, A.graphicID, 0);
		this.cmd(act.setHighlight, B.graphicID, 0);
		B.updateHeightAndBF();
		this.cmd(act.setText, B.heightLabelID, B.height);
		this.cmd(act.setText, B.bfLabelID, B.bf);
		A.updateHeightAndBF();
		this.cmd(act.setText, A.heightLabelID, A.height);
		this.cmd(act.setText, A.bfLabelID, A.bf);
		this.resizeTree(index);
		return A;
	}

	singleRotateLeft(tree, index) {
		const A = tree;
		const B = tree.right;
		const t2 = B.left;

		// this.cmd(act.setText, 0, 'Single Rotate Left');
		this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);
		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, B.graphicID, t2.graphicID);
			this.cmd(act.connect, A.graphicID, t2.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.setEdgeAlpha, A.graphicID, t2.graphicID, TreeMap.LINK_OPACITY);

			t2.parent = A;
		}
		this.cmd(act.disconnect, A.graphicID, B.graphicID);
		this.cmd(act.connect, B.graphicID, A.graphicID, TreeMap.LINK_COLOR);
		this.cmd(act.setEdgeAlpha, B.graphicID, A.graphicID, TreeMap.LINK_OPACITY);

		B.parent = A.parent;
		if (this.hashTableValues[index] === A) {
			this.hashTableValues[index] = B;
		} else {
			this.cmd(act.disconnect, A.parent.graphicID, A.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.connect, A.parent.graphicID, B.graphicID, TreeMap.LINK_COLOR);
			this.cmd(act.setEdgeAlpha, A.parent.graphicID, B.graphicID, TreeMap.LINK_OPACITY);

			if (A.isLeftChild()) {
				A.parent.left = B;
			} else {
				A.parent.right = B;
			}
		}
		B.left = A;
		A.parent = B;
		A.right = t2;
		this.cmd(act.setHighlight, A.graphicID, 0);
		this.cmd(act.setHighlight, B.graphicID, 0);
		A.updateHeightAndBF();
		this.cmd(act.setText, A.heightLabelID, A.height);
		this.cmd(act.setText, A.bfLabelID, A.bf);
		B.updateHeightAndBF();
		this.cmd(act.setText, B.heightLabelID, B.height);
		this.cmd(act.setText, B.bfLabelID, B.bf);

		this.resizeTree(index);
		return B;
	}

	getHeight(tree) {
		if (tree == null) {
			return -1;
		}
		return tree.height;
	}

	resetHeight(tree) {
		if (tree != null) {
			const newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
			if (tree.height !== newHeight) {
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
				this.cmd(act.setText, tree.heightLabelID, newHeight);
			}
		}
	}

    deleteNode(curr) {
		this.cmd(act.delete, curr.graphicID);
		this.cmd(act.delete, curr.heightLabelID);
		this.cmd(act.delete, curr.bfLabelID);
	}

    deleteElement(key) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Deleting entry with key: ' + key);
		const index = this.doHash(key);
		if (this.hashTableValues[index] == null) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Deleting entry with key: ' + key + '  Key not in table',
			);
			return this.commands;
		}
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 0);
		

		this.cmd(act.setText, this.ExplainLabel, `Deleting ${key}`);
		this.cmd(act.step);
		this.cmd(act.setText, this.ExplainLabel, ' ');

		this.highlightID = this.nextIndex++;
		this.hashTableValues[index] = this.removeH(this.hashTableValues[index], key, index);
		this.cmd(act.setText, this.ExplainLabel, '');
		this.resizeTree(index);
        
		return this.commands;
	}

	removeH(curr, key, index) {
		if (curr == null) {
			this.cmd(act.setText, this.ExplainLabel, `${key} not found in the tree`);
			return;
		}
		this.cmd(act.setHighlight, curr.graphicID, 1);
		if (this.compare(key, curr.key) < 0) {
			this.cmd(act.setText, this.ExplainLabel, `${key} < ${curr.key}. Looking left`);
			this.cmd(act.step);
			curr.left = this.removeH(curr.left, key, index);
			if (curr.left != null) {
				curr.left.parent = curr;
				this.connectSmart(curr.graphicID, curr.left.graphicID);
				this.resizeTree(index);
			}
		} else if (this.compare(key, curr.key) > 0) {
			this.cmd(act.setText, this.ExplainLabel, `${key} > ${curr.key}. Looking right`);
			this.cmd(act.step);
			curr.right = this.removeH(curr.right, key, index);
			if (curr.right != null) {
				curr.right.parent = curr;
				this.connectSmart(curr.graphicID, curr.right.graphicID);
				this.resizeTree(index);
			}
		} else {
			if (curr.left == null && curr.right == null) {
				this.cmd(act.setText, this.ExplainLabel, 'Element to delete is a leaf node');
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return null;
			} else if (curr.left == null) {
				this.cmd(act.setText, this.ExplainLabel, `One-child case, replace with right child`);
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return curr.right;
			} else if (curr.right == null) {
				this.cmd(act.setText, this.ExplainLabel, `One-child case, replace with left child`);
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return curr.left;
			} else {
                this.size--;
				const dummy = [];
				if (this.predSucc === 'succ') {
					this.cmd(act.setText, this.ExplainLabel, `Two-child case, replace data with successor`);
					this.cmd(act.step);
					curr.right = this.removeSucc(curr.right, dummy);
					curr.right && this.connectSmart(curr.graphicID, curr.right.graphicID);
				} else {
					this.cmd(act.setText, this.ExplainLabel, `Two-child case, replace data with predecessor`);
					this.cmd(act.step);
					curr.left = this.removePred(curr.left, dummy);
					curr.left && this.connectSmart(curr.graphicID, curr.left.graphicID);
				}
				this.resizeTree(index);
				curr.elem = dummy[0];
				this.cmd(act.setText, curr.graphicID, curr.elem);
			}
		}
		curr = this.balance(curr, index);
		this.cmd(act.setHighlight, curr.graphicID, 0);
		this.cmd(act.setText, this.ExplainLabel, '');
		return curr;
	}

	removeSucc(curr, dummy, index) {
		this.cmd(act.setHighlight, curr.graphicID, 1, '#0000ff');
		this.cmd(act.step);
		if (curr.left == null) {
			this.cmd(act.setText, this.ExplainLabel, 'No left child, replace with right child');
			this.cmd(act.step);
			dummy.push(curr.elem);
			this.deleteNode(curr);
			this.cmd(act.step);
			this.cmd(act.setText, this.ExplainLabel, '');
			return curr.right;
		}
		this.cmd(act.setText, 0, 'Left child exists, look left');
		this.cmd(act.step);
		curr.left = this.removeSucc(curr.left, dummy, index);
		if (curr.left != null) {
			curr.left.parent = curr;
			this.connectSmart(curr.graphicID, curr.left.graphicID);
			this.resizeTree(index);
		}
		curr = this.balance(curr, index);
		this.cmd(act.setHighlight, curr.graphicID, 0);
		return curr;
	}

	removePred(curr, dummy, index) {
		this.cmd(act.setHighlight, curr.graphicID, 1, '#0000ff');
		this.cmd(act.step);
		if (curr.right == null) {
			this.cmd(act.setText, this.ExplainLabel, 'No right child, replace with right child');
			this.cmd(act.step);
			dummy.push(curr.elem);
			this.deleteNode(curr);
			this.cmd(act.step);
			this.cmd(act.setText, this.ExplainLabel, '');
			return curr.left;
		}
		this.cmd(act.setText, 0, 'Right child exists, look right');
		this.cmd(act.step);
		curr.right = this.removePred(curr.right, dummy, index);
		if (curr.right != null) {
			curr.right.parent = curr;
			this.connectSmart(curr.graphicID, curr.right.graphicID);
			this.resizeTree(index);
		}
		curr = this.balance(curr, index);
		this.cmd(act.setHighlight, curr.graphicID, 0);
		return curr;
	}

    findElement(key) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Finding entry with key: ' + key);

		const index = this.doHash(key);
		const tmp = this.hashTableValues[index];
		this.doFind(tmp, key);

		return this.commands;
	}


	doFind(tree, key) {
		this.cmd(act.setText, 0, 'Searchiing for ' + key);
		if (tree != null) {
			this.cmd(act.setHighlight, tree.graphicID, 1);
			if (this.compare(tree.key, key) === 0) {
				this.cmd(
					act.setText,
					this.ExplainLabel,
					'Searching for ' + key + ' : ' + key + ' = ' + key + ' (Element found!)',
				);
				this.cmd(act.step);
				this.cmd(act.setText, this.ExplainLabel, 'Found Value:' + tree.value);
				this.cmd(act.setHighlight, tree.graphicID, 0);
			} else {
				if (this.compare(tree.key, key) > 0) {
					this.cmd(
						act.setText,
						0,
						'Searching for ' +
							key +
							' : ' +
							key +
							' < ' +
							tree.key +
							' (look to left subtree)',
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.left != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							TreeMap.HIGHLIGHT_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
					}
					this.doFind(tree.left, key);
				} else {
					this.cmd(
						act.setText,
						this.ExplainLabel,
						' Searching for ' +
							key +
							' : ' +
							key +
							' > ' +
							tree.key +
							' (look to right subtree)',
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.right != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							TreeMap.HIGHLIGHT_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
					}
					this.doFind(tree.right, key);
				}
			}
		} else {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				' Searching for ' + key + ' : < Empty Tree > (Element not found)',
			);
			this.cmd(act.step);
			this.cmd(act.setText, 0, ' Searching for ' + key + ' :  (Element not found)');
		}
	}

    resizeTree(index) {
		if (this.hashTableValues[index] == null) {
			return;
		}
		let startingPoint = POINTER_ARRAY_ELEM_START_X + index * POINTER_ARRAY_ELEM_WIDTH;
		this.resizeWidths(this.hashTableValues[index]);
		if (this.hashTableValues[index]  != null) {
			if (this.hashTableValues[index].leftWidth > startingPoint) {
				startingPoint = this.hashTableValues[index].leftWidth;
			} else if (this.hashTableValues[index].rightWidth > startingPoint) {
				startingPoint = Math.max(
					this.hashTableValues[index].leftWidth,
					2 * startingPoint - this.hashTableValues[index].rightWidth,
				);
			}
			this.setNewPositions(this.hashTableValues[index], startingPoint, TreeMap.STARTING_Y, 0);
			this.animateNewPositions(this.hashTableValues[index]);
			this.cmd(act.step);
		}
	}

	setNewPositions(tree, xPosition, yPosition, side) {
		if (tree != null) {
			tree.y = yPosition;
			if (side === -1) {
				xPosition = xPosition - tree.rightWidth;
				tree.heightLabelX = xPosition - 20;
				tree.bfLabelX = xPosition + 20;
			} else if (side === 1) {
				xPosition = xPosition + tree.leftWidth;
				tree.heightLabelX = xPosition - 20;
				tree.bfLabelX = xPosition + 20;
			} else {
				tree.heightLabelX = xPosition - 20;
				tree.bfLabelX = xPosition + 20;
			}
			tree.x = xPosition;
			tree.heightLabelY = tree.y - 20;
			tree.bfLabelY = tree.y - 20;
			this.setNewPositions(tree.left, xPosition, yPosition + TreeMap.HEIGHT_DELTA, -1);
			this.setNewPositions(tree.right, xPosition, yPosition + TreeMap.HEIGHT_DELTA, 1);
		}
	}

	animateNewPositions(tree) {
		if (tree != null) {
			this.cmd(act.move, tree.graphicID, tree.x, tree.y);
			this.cmd(act.move, tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
			this.cmd(act.move, tree.bfLabelID, tree.bfLabelX, tree.bfLabelY);
			this.animateNewPositions(tree.left);
			this.animateNewPositions(tree.right);
		}
	}

    resizeWidths(tree) {
		if (tree == null) {
			return 0;
		}
		tree.leftWidth = Math.max(this.resizeWidths(tree.left), TreeMap.WIDTH_DELTA / 2);
		tree.rightWidth = Math.max(this.resizeWidths(tree.right), TreeMap.WIDTH_DELTA / 2);
		return tree.leftWidth + tree.rightWidth;
	}
}

class AVLNode {
	constructor(elem, key, value, id, hid, bfid, initialX, initialY) {
        this.elem = elem;
        this.key = key;
        this.value = value;
		this.x = initialX;
		this.y = initialY;
		this.heightLabelID = hid;
		this.bfLabelID = bfid;
		this.height = 0;
		this.bf = 0;

		this.graphicID = id;
		this.left = null;
		this.right = null;
		this.parent = null;
	}

	updateHeightAndBF() {
		const h = node => (node == null ? -1 : node.height);
		const l = h(this.left);
		const r = h(this.right);
		this.height = Math.max(l, r) + 1;
		this.bf = l - r;
	}

	isLeftChild() {
		if (this.parent == null) {
			return true;
		}
		return this.parent.left === this;
	}
}

TreeMap.HIGHLIGHT_LABEL_COLOR = '#FF0000';

TreeMap.HIGHLIGHT_COLOR = '#007700';
TreeMap.HEIGHT_LABEL_COLOR = '#000000';

TreeMap.LINK_COLOR = '#000000';
TreeMap.LINK_OPACITY = 0.2;
TreeMap.HIGHLIGHT_CIRCLE_COLOR = '#007700';
TreeMap.FOREGROUND_COLOR = '#000000';
TreeMap.BACKGROUND_COLOR = '#FFFFFF';
TreeMap.PRINT_COLOR = '#007700';

TreeMap.WIDTH_DELTA = 50;
TreeMap.HEIGHT_DELTA = 50;
TreeMap.STARTING_Y = 150;

TreeMap.FIRST_PRINT_POS_X = 50;
TreeMap.PRINT_VERTICAL_GAP = 20;
TreeMap.PRINT_HORIZONTAL_GAP = 50;
TreeMap.EXPLANITORY_TEXT_X = 10;
TreeMap.EXPLANITORY_TEXT_Y = 10;