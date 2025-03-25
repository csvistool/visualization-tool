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
const ARRAY_START_Y = 50;
const ARRAY_LINE_SPACING = 75;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const COMP_COUNT_X = 100;
const COMP_COUNT_Y = 50;

// const ARRRAY_ELEMS_PER_LINE = 15;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const PUSH_LABEL_X = 50;
// const PUSH_LABEL_Y = 30;
// const PUSH_ELEMENT_X = 120;
// const PUSH_ELEMENT_Y = 30;

// const SIZE = 10;

const LARGE_OFFSET = 15;

export default class FredSort extends Algorithm {
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
		this.comparisonCountID = this.nextIndex++;

		this.compCount = 0;
		this.cmd(
			act.createLabel,
			this.comparisonCountID,
			'Comparison Count: ' + this.compCount,
			COMP_COUNT_X,
			COMP_COUNT_Y,
		);

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
		this.compCount = 0;
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		this.implementAction(this.clear.bind(this), true);
		this.implementAction(this.sort.bind(this), list);
	}

	exampleCallback() {
		const selection = this.exampleDropdown.value;
		this.exampleDropdown.options[0].text =
			this.exampleDropdown.options[this.exampleDropdown.selectedIndex].text;
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
		this.compCount = 0;
		if (!keepInput) this.listField.value = '';
		this.cmd(act.setText, this.infoLabelID, '');
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);
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

		// Calculate the number of partitions (ceiling of sqrt(n))
		const numPartitions = Math.ceil(Math.sqrt(this.arrayData.length));

		// Visually split into partitions
		const partition_bounds = [];
		this.secondArrayID = [];
		for (let i = 0; i < numPartitions; i++) {
			const left = Math.floor((i * this.arrayData.length) / numPartitions);
			const right = Math.min(
				this.arrayData.length - 1,
				Math.floor(((i + 1) * this.arrayData.length) / numPartitions) - 1,
			);
			const offset = i * LARGE_OFFSET;
			const prevOffset = i > 0 ? (i - 1) * LARGE_OFFSET : 0;
			this.secondArrayID.push(
				...this.drawArrayAndCopy(left, right, offset, prevOffset, 1).filter(
					id => id !== undefined,
				),
			);
			partition_bounds.push([left, right]);
		}

		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#0000FF',
			ARRAY_START_X,
			ARRAY_START_Y + ARRAY_LINE_SPACING,
		);
		this.cmd(act.setHighlight, this.iPointerID, 1);
		this.cmd(
			act.createHighlightCircle,
			this.jPointerID,
			'#0000FF',
			ARRAY_START_X + ARRAY_ELEM_WIDTH,
			ARRAY_START_Y + ARRAY_LINE_SPACING,
		);
		this.cmd(act.setHighlight, this.jPointerID, 1);

		// Insertion sort on each partition
		for (let a = 0; a < numPartitions; a++) {
			const left = partition_bounds[a][0];
			const right = partition_bounds[a][1];
			const num_elements = right - left + 1;
			this.cmd(act.step);

			// Insertion sort
			for (let i = 0; i < num_elements; i++) {
				this.cmd(act.step);
				for (let j = i; j >= 1; j--) {
					const index_offset = partition_bounds[a][0];
					this.movePointers(j - 1 + index_offset, j + index_offset, LARGE_OFFSET * a);
					this.cmd(act.step);
					this.cmd(
						act.setText,
						this.comparisonCountID,
						'Comparison Count: ' + ++this.compCount,
					);
					if (this.arrayData[j + index_offset] < this.arrayData[j - 1 + index_offset]) {
						this.swap(j + index_offset, j - 1 + index_offset, LARGE_OFFSET * a);
					}
					if (j === 1)
						this.cmd(
							act.setBackgroundColor,
							this.secondArrayID[index_offset],
							'#2ECC71',
						);
					this.cmd(
						act.setBackgroundColor,
						this.secondArrayID[j + index_offset],
						'#2ECC71',
					);
				}
			}
		}
		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);

		for (let i = 0; i < this.secondArrayID.length; i++) {
			this.cmd(act.setBackgroundColor, this.secondArrayID[i], '#FFFFFF');
		}

		// Merge partitions
		const offsets = [];
		for (let i = 0; i < numPartitions; i++) {
			const offset = i * LARGE_OFFSET;
			offsets.push(offset);
		}
		this.merge(partition_bounds, 0, offsets, this.arrayID);
		this.cmd(act.step);

		// Delete bottom array
		for (let i = 0; i < this.secondArrayID.length; i++) {
			this.cmd(act.delete, this.secondArrayID[i]);
		}

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

	swap(i, j, extra_offset) {
		this.cmd(act.setForegroundColor, this.iPointerID, '#FF0000');
		this.cmd(act.setForegroundColor, this.jPointerID, '#FF0000');
		this.cmd(act.step);

		const iLabelID = this.nextIndex++;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + extra_offset;
		const iYPos = ARRAY_START_Y + ARRAY_LINE_SPACING;
		this.cmd(act.createLabel, iLabelID, this.displayData[i], iXPos, iYPos);

		const jLabelID = this.nextIndex++;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X + extra_offset;
		const jYPos = ARRAY_START_Y + ARRAY_LINE_SPACING;
		this.cmd(act.createLabel, jLabelID, this.displayData[j], jXPos, jYPos);

		this.cmd(act.setText, this.secondArrayID[i], '');
		this.cmd(act.setText, this.secondArrayID[j], '');
		this.cmd(act.step);

		this.cmd(act.move, iLabelID, jXPos, jYPos);
		this.cmd(act.move, jLabelID, iXPos, iYPos);
		this.cmd(act.step);

		this.cmd(act.setText, this.secondArrayID[i], this.displayData[j]);
		this.cmd(act.setText, this.secondArrayID[j], this.displayData[i]);
		this.cmd(act.delete, iLabelID);
		this.cmd(act.delete, jLabelID);
		this.cmd(act.step);

		// Swap data in backend array
		let temp = this.arrayData[i];
		this.arrayData[i] = this.arrayData[j];
		this.arrayData[j] = temp;

		// Swap data in display array
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;

		this.cmd(act.setForegroundColor, this.iPointerID, '#0000FF');
		this.cmd(act.setForegroundColor, this.jPointerID, '#0000FF');
		this.cmd(act.step);
	}

	merge(partition_bounds, currOffset, offsets, currArrayID) {
		const tempArray = new Array(this.arrayData.length); // Temporary array to store data for sorting
		const tempDisplay = new Array(this.arrayData.length);

		// Copy data to temporary array
		for (let i = 0; i < partition_bounds.length; i++) {
			const [left, right] = partition_bounds[i];
			for (let j = left; j <= right; j++) {
				tempArray[j] = this.arrayData[j];
				tempDisplay[j] = this.displayData[j];
			}
		}

		// Create pointers
		const bottomYPos = ARRAY_START_Y + ARRAY_LINE_SPACING;
		const pointers = [];
		for (let i = 0; i < partition_bounds.length; i++) {
			const [left] = partition_bounds[i];
			const pointerID = this.nextIndex++;
			const xPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + offsets[i];
			this.cmd(act.createHighlightCircle, pointerID, '#0000FF', xPos, bottomYPos);
			pointers.push(pointerID);
		}
		const kPointerID = this.nextIndex++;
		const kXPos = partition_bounds[0][0] * ARRAY_ELEM_WIDTH + ARRAY_START_X + currOffset;
		const topYPos = ARRAY_START_Y;
		this.cmd(act.createHighlightCircle, kPointerID, '#0000FF', kXPos, topYPos);
		this.cmd(act.step);

		// Merge data and animate
		const indices = partition_bounds.map(([left]) => left);
		let k = partition_bounds[0][0];
		while (indices.some((index, i) => index <= partition_bounds[i][1])) {
			let minIndex = -1;
			for (let i = 0; i < indices.length; i++) {
				if (indices[i] <= partition_bounds[i][1]) {
					if (minIndex === -1 || tempArray[indices[i]] < tempArray[indices[minIndex]]) {
						minIndex = i;
					}
				}
			}
			this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
			this.cmd(act.step);
			this.copyData(
				indices[minIndex],
				k,
				offsets[minIndex],
				currOffset,
				1,
				0,
				tempDisplay[indices[minIndex]],
				currArrayID[k],
				pointers[minIndex],
			);
			this.arrayData[k] = tempArray[indices[minIndex]];
			this.displayData[k] = tempDisplay[indices[minIndex]];
			indices[minIndex]++;
			if (indices[minIndex] <= partition_bounds[minIndex][1]) {
				// console.log(minIndex, offsets[minIndex])
				this.movePointer(indices[minIndex], 1, offsets[minIndex], pointers[minIndex]);
			}
			k++;
			this.movePointer(k, 0, currOffset, kPointerID);
			this.cmd(act.step);
		}

		// Delete pointers
		for (const pointerID of pointers) {
			this.cmd(act.delete, pointerID);
		}
		this.cmd(act.delete, kPointerID);
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
