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
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { BFS_DFS_ADJ_LIST } from './util/GraphValues';
import Graph from './Graph.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const DFS_STACK_TOP_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const LIST_START_X = 30;
const LIST_START_Y = 70;
const LIST_SPACING = 20;

const VISITED_START_X = 30;
const VISITED_START_Y = 120;

const CURRENT_VERTEX_LABEL_X = 25;
const CURRENT_VERTEX_LABEL_Y = 145;
const CURRENT_VERTEX_X = 115;
const CURRENT_VERTEX_Y = 151;

const STACK_LABEL_X = 25;
const STACK_LABEL_Y = 170;

const STACK_START_X = 40;
const SMALL_STACK_START_Y = 335;
const LARGE_STACK_START_Y = 465;
const SMALL_STACK_SPACING = 20;
const LARGE_STACK_SPACING = 16;

const RECURSION_START_X = 125;
const RECURSION_START_Y = 185;
const SMALL_RECURSION_SPACING_X = 20;
const LARGE_RECURSION_SPACING_X = 10;
const SMALL_RECURSION_SPACING_Y = 20;
const LARGE_RECURSION_SPACING_Y = 15;

const CODE_START_X = 1000;
const CODE_START_Y = 50;

export default class DFS extends Graph {
	constructor(am, w, h) {
		super(am, w, h, BFS_DFS_ADJ_LIST);
		this.addControls();
		this.physicalStack = false;
	}

	addControls() {
		addLabelToAlgorithmBar('Start vertex: ');

		this.startField = addControlToAlgorithmBar('Text', '');
		this.startField.style.textAlign = 'center';
		this.startField.onkeydown = this.returnSubmit(
			this.startField,
			this.startCallback.bind(this),
			1,
			false,
		);
		this.controls.push(this.startField);

		this.startButton = addControlToAlgorithmBar('Button', 'Run');
		this.startButton.onclick = this.startCallback.bind(this);
		this.controls.push(this.startButton);

		addDivisorToAlgorithmBar();

		const radioButtonList = addRadioButtonGroupToAlgorithmBar(
			['Recursion', 'Stack'],
			'StackType',
		);

		this.recursiveStackButton = radioButtonList[0];
		this.recursiveStackButton.onclick = this.stackCallback.bind(this, false);
		this.recursiveStackButton.checked = true;
		this.controls.push(this.recursiveStackButton);

		this.physicalStackButton = radioButtonList[1];
		this.physicalStackButton.onclick = this.stackCallback.bind(this, true);
		this.controls.push(this.physicalStackButton);

		addDivisorToAlgorithmBar();

		// this.startButton1 = addControlToAlgorithmBar('Button', 'Create Graph');
		// this.startButton1.onclick = this.openCreateGraphModal.bind(this);
		// this.controls.push(this.startButton1);

		super.addControls();
	}

	setup(adjMatrix) {
		super.setup(adjMatrix);
		this.commands = [];
		this.messageID = [];

		this.visited = [];

		this.stackID = [];
		this.listID = [];
		this.visitedID = [];

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Visited Set:',
			VISITED_START_X - 5,
			VISITED_START_Y - 25,
			0,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'List:',
			LIST_START_X - 5,
			LIST_START_Y - 25,
			0,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Current vertex:',
			CURRENT_VERTEX_LABEL_X,
			CURRENT_VERTEX_LABEL_Y,
			0,
		);

		this.stackLabelID = this.nextIndex++;
		this.cmd(
			act.createLabel,
			this.stackLabelID,
			this.physicalStack ? 'Stack:' : 'Recursive stack:   Recursive calls:',
			STACK_LABEL_X,
			STACK_LABEL_Y,
			0,
		);

		this.pseudocode = pseudocodeText.DFS;
		if (this.physicalStack) {
			this.codeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'iterative',
				CODE_START_X,
				CODE_START_Y,
			);
		} else {
			this.codeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'recursive',
				CODE_START_X,
				CODE_START_Y,
			);
		}

		this.animationManager.setAllLayers([0, 32, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.listID = [];
		this.visitedID = [];
		this.messageID = [];
	}

	stackCallback(physical) {
		if (this.physicalStack !== physical) {
			this.physicalStack = physical;
			this.animationManager.resetAll();
			this.setup(this.adj_matrix);
		}
	}

	startCallback() {
		if (this.startField.value !== '') {
			let startValue = this.startField.value;
			this.startField.value = '';
			startValue = startValue.toUpperCase();
			if (this.physicalStack) {
				this.implementAction(this.doDFSStack.bind(this), startValue);
			} else {
				this.implementAction(this.doDFSRecursive.bind(this), startValue);
			}
		} else {
			this.shake(this.startButton);
		}
	}

	doDFSStack(startValue) {
		this.commands = [];
		let vertex = startValue.charCodeAt(0) - 65;

		// User input validation
		if (vertex < 0 || vertex >= this.size) {
			this.shake(this.startButton);
			this.cmd(act.setText, this.infoLabelID, startValue + ' is not a vertex in the graph');
			return this.commands;
		}

		this.clear();

		this.visited = new Array(this.size);
		this.stack = [];
		this.stackID = [];
		this.listID = [];
		this.visitedID = [];
		this.stackStartY = this.isLarge ? LARGE_STACK_START_Y : SMALL_STACK_START_Y;
		this.stackSpacing = this.isLarge ? LARGE_STACK_SPACING : SMALL_STACK_SPACING;

		this.rebuildEdges();

		this.cmd(
			act.setText,
			this.infoLabelID,
			'Pushing ' + this.toStr(vertex) + ' and adding to visited set',
		);
		this.highlight(1, 0, this.codeID);
		this.highlight(2, 0, this.codeID);
		let vertexID = this.nextIndex++;
		this.visited[vertex] = true;
		this.visitedID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(vertex),
			VISITED_START_X,
			VISITED_START_Y,
		);
		this.cmd(act.setBackgroundColor, this.circleID[vertex], VISITED_COLOR);
		this.stack.push(vertex);
		this.stackID.push(vertexID);
		this.cmd(act.createLabel, vertexID, this.toStr(vertex), STACK_START_X, this.stackStartY);
		this.cmd(act.step);

		this.unhighlight(1, 0, this.codeID);
		this.unhighlight(2, 0, this.codeID);
		this.highlight(3, 0, this.codeID);
		while (this.stack.length > 0 && this.listID.length < this.size) {
			vertex = this.stack.pop();
			vertexID = this.stackID.pop();

			this.highlight(4, 0, this.codeID);
			this.cmd(act.step);
			this.unhighlight(4, 0, this.codeID);
			this.highlight(5, 0, this.codeID);

			this.cmd(
				act.setText,
				this.infoLabelID,
				'Popping ' + this.toStr(vertex) + ' and adding to list',
			);

			this.cmd(act.setTextColor, vertexID, DFS_STACK_TOP_COLOR);
			this.cmd(act.move, vertexID, CURRENT_VERTEX_X, CURRENT_VERTEX_Y);

			this.listID.push(this.nextIndex);
			this.cmd(
				act.createLabel,
				this.nextIndex++,
				this.toStr(vertex),
				LIST_START_X + (this.listID.length - 1) * LIST_SPACING,
				LIST_START_Y,
			);

			this.visitVertex(vertex);

			this.cmd(act.step);

			this.unhighlight(5, 0, this.codeID);

			this.highlight(6, 0, this.codeID);
			for (let neighbor = 0; neighbor < this.size; neighbor++) {
				if (this.adj_matrix[vertex][neighbor] > 0) {
					this.highlightEdge(vertex, neighbor, 1);
					this.highlight(7, 0, this.codeID);
					this.cmd(act.step);
					if (!this.visited[neighbor]) {
						this.unhighlight(7, 0, this.codeID);
						this.highlight(8, 0, this.codeID);
						this.visited[neighbor] = true;
						this.visitedID.push(this.nextIndex);
						this.cmd(
							act.setText,
							this.infoLabelID,
							this.toStr(neighbor) +
								' has not yet been visited, pushing and adding to visited set',
						);
						this.cmd(
							act.createLabel,
							this.nextIndex++,
							this.toStr(neighbor),
							VISITED_START_X + (this.visitedID.length - 1) * LIST_SPACING,
							VISITED_START_Y,
						);
						this.cmd(act.setBackgroundColor, this.circleID[neighbor], VISITED_COLOR);
						this.stack.push(neighbor);
						this.stackID.push(this.nextIndex);
						this.cmd(
							act.createLabel,
							this.nextIndex++,
							this.toStr(neighbor),
							STACK_START_X,
							this.stackStartY - (this.stack.length - 1) * this.stackSpacing,
						);
					} else {
						this.unhighlight(7, 0, this.codeID);
						this.cmd(
							act.setText,
							this.infoLabelID,
							this.toStr(neighbor) + ' has already been visited, skipping',
						);
					}
					this.cmd(act.step);
					this.unhighlight(8, 0, this.codeID);
					// this.highlightEdge(vertex, neighbor, 0);
				}
			}
			this.unhighlight(6, 0, this.codeID);

			this.cmd(act.delete, vertexID);

			this.leaveVertex();
		}
		this.unhighlight(3, 0, this.codeID);

		if (this.stack.length > 0) {
			this.cmd(act.setText, this.infoLabelID, 'All vertices have been visited, done');
		} else {
			this.cmd(act.setText, this.infoLabelID, 'Stack is empty, done');
		}

		return this.commands;
	}

	doDFSRecursive(startValue) {
		this.commands = [];
		const vertex = startValue.charCodeAt(0) - 65;

		// User input validation
		if (vertex < 0 || vertex >= this.size) {
			this.shake(this.startButton);
			this.cmd(act.setText, this.infoLabelID, startValue + ' is not a vertex in the graph');
			return this.commands;
		}

		this.clear();

		this.visited = new Array(this.size);
		this.listID = [];
		this.visitedID = [];
		this.stackStartY = this.isLarge ? LARGE_STACK_START_Y : SMALL_STACK_START_Y;
		this.stackSpacing = this.isLarge ? LARGE_STACK_SPACING : SMALL_STACK_SPACING;
		this.recursionSpacingX = this.isLarge
			? LARGE_RECURSION_SPACING_X
			: SMALL_RECURSION_SPACING_X;
		this.recursionSpacingY = this.isLarge
			? LARGE_RECURSION_SPACING_Y
			: SMALL_RECURSION_SPACING_Y;
		this.currentID = this.nextIndex++;

		this.rebuildEdges();

		this.cmd(act.setText, this.infoLabelID, '');

		this.cmd(act.createLabel, this.currentID, '', CURRENT_VERTEX_X, CURRENT_VERTEX_Y);
		this.cmd(act.setTextColor, this.currentID, DFS_STACK_TOP_COLOR);

		this.cmd(act.setText, this.infoLabelID, 'About to recurse to ' + this.toStr(startValue));
		this.cmd(act.step);

		this.visitVertex(vertex);

		this.dfsVisit(vertex, RECURSION_START_X);

		this.cmd(act.setText, this.infoLabelID, 'Returned from ' + this.toStr(vertex) + ', done');
		this.cmd(act.delete, this.currentID);
		this.leaveVertex();

		return this.commands;
	}

	dfsVisit(currVertex, messageX) {
		this.cmd(
			act.setText,
			this.infoLabelID,
			'Visiting ' + this.toStr(currVertex) + ' and adding to list',
		);
		this.cmd(act.setText, this.currentID, this.toStr(currVertex));

		this.stackID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(currVertex),
			STACK_START_X,
			this.stackStartY - (this.stackID.length - 1) * this.stackSpacing,
		);

		const nextMessage = this.nextIndex++;
		this.messageID.push(nextMessage);
		this.cmd(
			act.createLabel,
			nextMessage,
			'DFS(' + this.toStr(currVertex) + ')',
			messageX,
			RECURSION_START_Y + (this.messageID.length - 1) * this.recursionSpacingY,
			0,
		);

		this.listID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(currVertex),
			LIST_START_X + (this.listID.length - 1) * LIST_SPACING,
			LIST_START_Y,
		);

		this.visited[currVertex] = true;
		this.visitedID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(currVertex),
			VISITED_START_X + (this.visitedID.length - 1) * LIST_SPACING,
			VISITED_START_Y,
		);
		this.cmd(act.setBackgroundColor, this.circleID[currVertex], VISITED_COLOR);
		this.highlight(1, 0, this.codeID);
		this.highlight(2, 0, this.codeID);
		this.cmd(act.step);
		this.unhighlight(1, 0, this.codeID);
		this.unhighlight(2, 0, this.codeID);

		this.highlight(3, 0, this.codeID);
		for (let neighbor = 0; neighbor < this.size; neighbor++) {
			if (this.adj_matrix[currVertex][neighbor] > 0) {
				this.highlight(4, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(4, 0, this.codeID);
				if (this.visited[neighbor]) {
					this.unhighlight(4, 0, this.codeID);
					// this.highlightEdge(currVertex, neighbor, 1, 'blue');
					this.cmd(
						act.setText,
						this.infoLabelID,
						'Vertex ' + this.toStr(neighbor) + ' already visited, skipping',
					);
					this.cmd(act.step);
					// this.highlightEdge(currVertex, neighbor, 0);
				} else {
					this.highlight(5, 0, this.codeID);
					this.highlightEdge(currVertex, neighbor, 1, 'red');
					this.cmd(
						act.setText,
						this.infoLabelID,
						'About to recurse to ' + this.toStr(neighbor),
					);
					this.cmd(act.step);
					this.unhighlight(5, 0, this.codeID);
					this.unhighlight(3, 0, this.codeID);

					this.leaveVertex();
					this.visitVertex(neighbor);
					// this.highlightEdge(currVertex, neighbor, 0);

					this.dfsVisit(neighbor, messageX + this.recursionSpacingX);
					this.highlight(3, 0, this.codeID);

					this.leaveVertex();
					this.visitVertex(currVertex);
					this.cmd(
						act.setText,
						this.infoLabelID,
						'Returned from ' + this.toStr(neighbor) + ' to ' + this.toStr(currVertex),
					);
					this.cmd(act.step);
				}
			}
		}
		this.unhighlight(3, 0, this.codeID);

		this.cmd(act.delete, this.stackID.pop());
	}

	clear() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], '#FFFFFF');
			this.visited[i] = false;
		}
		for (let i = 0; i < this.listID.length; i++) {
			this.cmd(act.delete, this.listID[i]);
		}
		this.listID = [];
		for (let i = 0; i < this.visitedID.length; i++) {
			this.cmd(act.delete, this.visitedID[i]);
		}
		this.visitedID = [];
		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.messageID = [];
		this.cmd(act.setText, this.infoLabelID, '');
	}

	// Add this new method in the class
	/*openCreateGraphModal() {
		// Create modal container
		const modal = document.createElement('div');
		modal.style.position = 'fixed';
		modal.style.top = '50%';
		modal.style.left = '50%';
		modal.style.transform = 'translate(-50%, -50%)';
		modal.style.zIndex = '1000';
		modal.style.width = '80%';
		modal.style.height = '80%';
		modal.style.backgroundColor = '#fff';
		modal.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
		modal.style.padding = '20px';
		modal.style.overflow = 'hidden';

		// Create iframe for the webpage
		const iframe = document.createElement('iframe');
		iframe.src = '../CreateGraph'; // Path to CreateGraph page
		iframe.style.width = '100%';
		iframe.style.height = '90%';
		iframe.style.border = 'none';

		// Add iframe to modal
		modal.appendChild(iframe);

		// Create a close button
		const closeButton = document.createElement('button');
		closeButton.innerText = 'Close';
		closeButton.style.position = 'absolute';
		closeButton.style.top = '10px';
		closeButton.style.right = '10px';
		closeButton.style.backgroundColor = '#f44336';
		closeButton.style.color = '#fff';
		closeButton.style.border = 'none';
		closeButton.style.padding = '10px';
		closeButton.style.cursor = 'pointer';
		closeButton.onclick = () => {
			document.body.removeChild(modal);
		};

		// Add close button to modal
		modal.appendChild(closeButton);

		// Append modal to the document body
		document.body.appendChild(modal);
	}*/
}
