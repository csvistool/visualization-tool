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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain.js';

const MAX_ARRAY_SIZE = 15;

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const ARRAY_START_X = 650;
const ARRAY_START_Y = 100;
const ARRAY_LINE_SPACING = 75;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

export default class MergeSort extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		// TODO:  Add any code necessary to set up your own algorithm.  Initialize data
		// structures, etc.
		this.setup();
	}

	addControls() {
		this.controls = [];

		const verticalGroup = addGroupToAlgorithmBar(false);

		addLabelToAlgorithmBar(
			'Comma separated list (e.g. "3,1,2"). Max 15 elements & no elements > 999',
			verticalGroup,
		);

		const horizontalGroup = addGroupToAlgorithmBar(true, verticalGroup);

		// List text field
		this.listField = addControlToAlgorithmBar('Text', '', horizontalGroup);
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false,
		);
		this.controls.push(this.listField);

		// Sort button
		this.sortButton = addControlToAlgorithmBar('Button', 'Sort', horizontalGroup);
		this.sortButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.sortButton);

		addDivisorToAlgorithmBar();

		// Examples dropdown
		this.exampleDropdown = addDropDownGroupToAlgorithmBar(
			[
				['', 'Select Example'],
				['1,2,3,4,5,6,7,8,9', 'Sorted'],
				['9,8,7,6,5,4,3,2,1', 'Reverse Sorted'],
				['2,3,4,5,6,7,8,9,1', 'Almost Sorted'],
				['Random', 'Random'],
			],
			'Example',
		);
		this.exampleDropdown.onchange = this.exampleCallback.bind(this);
		this.controls.push(this.exampleDropdown);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setURLData(searchParams) {
		const data = searchParams.get('data');
		this.listField.value = data;
		this.sortCallback();
	}

	setup() {
		this.commands = [];
		this.arrayData = [];
		this.arrayID = [];

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;

		this.resetIndex = this.nextIndex;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = this.resetIndex;
		this.arrayData = [];
		this.arrayID = [];
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		this.implementAction(this.clear.bind(this), true);
		this.implementAction(this.sort.bind(this), list);
	}

	exampleCallback() {
		const selection = this.exampleDropdown.value;
		this.exampleDropdown.options[0].text = this.exampleDropdown.options[this.exampleDropdown.selectedIndex].text;
		if (!selection) {
			return;
		}

		let values = '';
		if (selection === 'Random') {
			//Generate between 5 and 15 random values
			const RANDOM_ARRAY_SIZE = Math.floor(Math.random() * 9) + 5;
			const MIN_DATA_VALUE = 1;
			const MAX_DATA_VALUE = 14;
			for (let i = 0; i < RANDOM_ARRAY_SIZE; i++) {
				values += (
					Math.floor(Math.random() * (MAX_DATA_VALUE - MIN_DATA_VALUE)) + MIN_DATA_VALUE
				).toString();
				if (i < RANDOM_ARRAY_SIZE - 1) {
					values += ',';
				}
			}
		} else {
			values = selection;
		}
		this.exampleDropdown.value = '';
		this.listField.value = values;
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear(keepInput) {
		this.commands = [];
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd(act.delete, this.arrayID[i]);
		}
		this.arrayData = [];
		this.displayData = [];
		this.arrayID = [];
		if (!keepInput) this.listField.value = '';
		this.cmd(act.setText, this.infoLabelID, '');
		return this.commands;
	}

	sort(list) {
		this.commands = [];

		// User input validation
		if (!list.length) {
			this.shake(this.sortButton);
			this.cmd(act.setText, this.infoLabelID, 'Data must contain integers such as "3,1,2"');
			return this.commands;
		} else if (list.length > MAX_ARRAY_SIZE) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				`Data cannot contain more than ${MAX_ARRAY_SIZE} numbers (you put ${list.length})`,
			);
			return this.commands;
		} else if (list.map(Number).filter(x => x > 999 || Number.isNaN(x)).length) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Data cannot contain non-numeric values or numbers > 999',
			);
			return this.commands;
		}

		this.highlight(0, 0, this.codeID);

		this.arrayID = [];
		this.arrayData = list
			.map(Number)
			.filter(x => !Number.isNaN(x))
			.slice(0, MAX_ARRAY_SIZE);
		this.displayData = new Array(this.arrayData.length);

		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < this.arrayData.length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'a');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < this.arrayData.length; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yPos = ARRAY_START_Y;
			this.arrayID.push(this.nextIndex);

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.displayData[i] = displayData;
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos,
			);
		}

		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#0000FF',
			ARRAY_START_X,
			ARRAY_START_Y,
		);
		this.cmd(act.setHighlight, this.iPointerID, 1);

		// Create a second empty array below the first array
		this.secondArrayID = [];
		for (let i = 0; i < this.arrayData.length; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yPos = ARRAY_START_Y + ARRAY_LINE_SPACING * 2;
			this.secondArrayID.push(this.nextIndex);
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos,
			);
		}
		this.cmd(act.step);

		// Create timers above each element
		this.timerIDs = [];
		for (let i = 0; i < this.arrayData.length; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yPos = ARRAY_START_Y - ARRAY_LINE_SPACING / 2;
			const timerID = this.nextIndex++;
			this.timerIDs.push(timerID);
			this.cmd(act.createLabel, timerID, '', xPos, yPos);
		}

		this.cmd(
			act.setText,
			this.infoLabelID,
			'Setting sleep timers for each element.',
		);
		
		for (let i = 0; i < this.arrayData.length; i++) {
			this.cmd(
				act.move,
				this.iPointerID,
				i * ARRAY_ELEM_WIDTH + ARRAY_START_X,
				ARRAY_START_Y,
			);
			this.cmd(act.step);
			this.cmd(act.setText, this.timerIDs[i], this.arrayData[i]);
			this.cmd(act.setForegroundColor, this.timerIDs[i], '#0000FF');
			this.cmd(act.step);
		}

		this.cmd(
			act.setText,
			this.infoLabelID,
			'Waiting for elements to "wake up" and be copied into the next spot.',
		);

		this.cmd(act.delete, this.iPointerID);
		this.cmd(
			act.createHighlightCircle,
			this.jPointerID,
			'#00FF00',
			ARRAY_START_X,
			ARRAY_START_Y + ARRAY_LINE_SPACING * 2,
		);
		this.cmd(act.setHighlight, this.jPointerID, 1);
		
		let max_value = Math.max(...this.arrayData);
		let j = 0;
		const timers = [...this.arrayData];
		while (max_value > 0) {
			max_value--;
			this.cmd(act.step);
			this.cmd(act.step);
			for (let i = 0; i < timers.length; i++) {
				if (timers[i] > 0) {
					timers[i]--;
					this.cmd(act.setText, this.timerIDs[i], timers[i]);
					if (timers[i] === 0) {
						this.cmd(act.setText, this.infoLabelID, `Copying ${this.displayData[i]} to next spot because its sleep timer elapsed.`);
						const labelID = this.nextIndex++;
						this.cmd(act.createLabel, labelID, this.displayData[i], ARRAY_START_X + i * ARRAY_ELEM_WIDTH, ARRAY_START_Y);
						this.cmd(act.move, labelID, ARRAY_START_X + j * ARRAY_ELEM_WIDTH, ARRAY_START_Y + ARRAY_LINE_SPACING * 2);
						this.cmd(act.step);
						this.cmd(act.setText, this.secondArrayID[j], this.displayData[i]);
						this.cmd(act.delete, labelID);
						this.cmd(act.setBackgroundColor, this.secondArrayID[j], '#2ECC71');
						this.cmd(act.step);
						this.cmd(act.setBackgroundColor, this.arrayID[i], '#D3D3D3');
						this.cmd(act.setText, this.timerIDs[i], '');
						j += 1;
						this.cmd(
							act.move,
							this.jPointerID,
							j * ARRAY_ELEM_WIDTH + ARRAY_START_X,
							ARRAY_START_Y + ARRAY_LINE_SPACING * 2,
						);
						this.cmd(act.step);
					}
					this.cmd(
						act.setText,
						this.infoLabelID,
						'Waiting for elements to "wake up" and be copied into the next spot.',
					);
				}
			}
		}
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.setText, this.infoLabelID, 'Sorting complete.');

		return this.commands;
	}

	drawArrayAndCopy(left, right, offset, prevOffset, row) {
		const tempArrayID = [];

		// Display subarray
		for (let i = left; i <= right; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
			const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
			tempArrayID[i] = this.nextIndex;
			this.arrayID.push(this.nextIndex);
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos,
			);
		}
		this.cmd(act.step);

		// Copy elements from big array to current subarray
		for (let i = left; i <= right; i++) {
			this.copyData(
				i,
				i,
				prevOffset,
				offset,
				row - 1,
				row,
				this.displayData[i],
				tempArrayID[i],
				-1,
			);
		}

		return tempArrayID;
	}

	movePointers(i, j, extra_offset) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + extra_offset;
		const iYPos = ARRAY_START_Y + ARRAY_LINE_SPACING;
		this.cmd(act.move, this.iPointerID, iXPos, iYPos);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X + extra_offset;
		const jYPos = ARRAY_START_Y + ARRAY_LINE_SPACING;
		this.cmd(act.move, this.jPointerID, jXPos, jYPos);
		this.cmd(act.step);
	}

	copyData(fromIndex, toIndex, fromOffset, toOffset, fromRow, toRow, value, cellID, pointerID) {
		if (pointerID !== -1) {
			this.cmd(act.setForegroundColor, pointerID, '#FF0000');
			this.cmd(act.step);
		}
		const fromXPos = fromIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + fromOffset;
		const fromYPos = ARRAY_START_Y + fromRow * ARRAY_LINE_SPACING;
		const labelID = this.nextIndex++;
		this.cmd(act.createLabel, labelID, value, fromXPos, fromYPos);
		const toXPos = toIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + toOffset;
		const toYPos = ARRAY_START_Y + toRow * ARRAY_LINE_SPACING;
		this.cmd(act.move, labelID, toXPos, toYPos);
		this.cmd(act.step);
		this.cmd(act.setText, cellID, value);
		this.cmd(act.delete, labelID);
		if (pointerID !== -1) {
			this.cmd(act.setBackgroundColor, cellID, '#2ECC71');
			this.cmd(act.setForegroundColor, pointerID, '#0000FF');
			this.cmd(act.step);
		}
	}

	movePointer(index, row, offset, pointerID) {
		const xPos = index * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
		const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
		this.cmd(act.move, pointerID, xPos, yPos);
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}
