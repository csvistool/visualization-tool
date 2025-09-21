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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 100;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 200;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 8;
const LINKED_LIST_ELEM_SPACING = 150;
const LINKED_LIST_LINE_SPACING = 100;

const QUEUE_LABEL_X = 60;
const QUEUE_LABEL_Y = 30;
const QUEUE_ELEMENT_X = 130;
const QUEUE_ELEMENT_Y = 30;

const HEAD_POS_X = 180;
const HEAD_POS_Y = 100;

const TAIL_POS_X = 180;

const POINTER_LABEL_X = 130;
const HEAD_LABEL_Y = 100;

const POINTER_ELEM_WIDTH = 30;
const POINTER_ELEM_HEIGHT = 30;

const SIZE = 32;

export default class DequeLL extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.tail_pos_y = h - LINKED_LIST_ELEM_HEIGHT;
		this.tail_label_y = this.tail_pos_y;
		this.setup();
		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];

		// Add's value text field
		this.addField = addControlToAlgorithmBar('Text', '');
		this.addField.style.textAlign = 'center';
		this.addField.onkeydown = this.returnSubmit(this.addField, null, 4, false);
		this.controls.push(this.addField);

		// Add first button
		this.addFirstButton = addControlToAlgorithmBar('Button', 'Add First');
		this.addFirstButton.onclick = this.addFirstCallback.bind(this);
		this.controls.push(this.addFirstButton);

		addLabelToAlgorithmBar('or');

		// Add last button
		this.addLastButton = addControlToAlgorithmBar('Button', 'Add Last');
		this.addLastButton.onclick = this.addLastCallback.bind(this);
		this.controls.push(this.addLastButton);

		addDivisorToAlgorithmBar();

		// Remove first button
		this.removeFirstButton = addControlToAlgorithmBar('Button', 'Remove First');
		this.removeFirstButton.onclick = this.removeFirstCallback.bind(this);
		this.controls.push(this.removeFirstButton);

		addLabelToAlgorithmBar('or');

		// Remove last button
		this.removeLastButton = addControlToAlgorithmBar('Button', 'Remove Last');
		this.removeLastButton.onclick = this.removeLastCallback.bind(this);
		this.controls.push(this.removeLastButton);

		addDivisorToAlgorithmBar();

		this.randomButton = addControlToAlgorithmBar('Button', 'Random');
		this.randomButton.onclick = this.randomCallback.bind(this);
		this.controls.push(this.randomButton);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

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

	setURLData(searchParams) {
		this.implementAction(this.clearAll.bind(this));
		const dataList = searchParams
			.get('data')
			.split(',')
			.filter(item => item.trim() !== '');
		dataList.reverse();
		dataList.forEach(dataEntry => {
			this.implementAction(this.add.bind(this), dataEntry.substring(0, 4), 0);
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		});
	}

	setup() {
		this.linkedListElemID = new Array(SIZE);

		this.headID = this.nextIndex++;
		this.headLabelID = this.nextIndex++;

		this.tailID = this.nextIndex++;
		this.tailLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.size = 0;
		this.leftoverLabelID = this.nextIndex++;
		this.leftoverValID = this.nextIndex++;

		this.cmd(act.createLabel, this.headLabelID, 'Head', POINTER_LABEL_X, HEAD_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.headID,
			'',
			POINTER_ELEM_WIDTH,
			POINTER_ELEM_HEIGHT,
			HEAD_POS_X,
			HEAD_POS_Y,
		);

		this.cmd(act.createLabel, this.tailLabelID, 'Tail', POINTER_LABEL_X, this.tail_label_y);
		this.cmd(
			act.createRectangle,
			this.tailID,
			'',
			POINTER_ELEM_WIDTH,
			POINTER_ELEM_HEIGHT,
			TAIL_POS_X,
			this.tail_pos_y,
		);

		this.cmd(act.setNull, this.headID, 1);
		this.cmd(act.setNull, this.tailID, 1);

		this.cmd(act.createLabel, this.leftoverLabelID, '', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, this.leftoverValID, '', QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		this.highlight1ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.size = 0;
		this.nextIndex = this.initialIndex;
		this.highlight1ID = this.nextIndex++;
	}

	addFirstCallback() {
		if (this.addField.value !== '') {
			const addVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.add.bind(this), addVal, 0);
		} else {
			this.shake(this.addFirstButton);
		}
	}

	addLastCallback() {
		if (this.addField.value !== '') {
			const addVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.add.bind(this), addVal, this.size);
		} else {
			this.shake(this.addLastButton);
		}
	}

	removeFirstCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), 0);
		} else {
			this.shake(this.removeFirstButton);
		}
	}

	removeLastCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), this.size - 1);
		} else {
			this.shake(this.removeLastButton);
		}
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = 5;
		const MIN_SIZE = 2;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
		const set = new Set();

		this.implementAction(this.clearAll.bind(this));

		for (let i = 0; i < randomSize; i++) {
			const val = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			if (set.has(val)) {
				i--;
			} else {
				set.add(val);
				this.implementAction(this.add.bind(this), val, 0);
			}
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	add(elemToAdd, index) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		if (index === 0) {
			this.highlight(0, 0, 'addFirst')
		} else if (index === this.size) {
			this.highlight(0, 0, 'addLast')
		}
		this.cmd(act.step);

		if (index === 0) {
			this.highlight(1, 0, 'addFirst');
		} else if (index === this.size) {
			this.highlight(1, 0, 'addLast');
		}
		this.cmd(act.step);

		for (let i = this.size - 1; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
			this.linkedListElemID[i + 1] = this.linkedListElemID[i];
		}
		this.arrayData[index] = elemToAdd;
		this.linkedListElemID[index] = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');

		this.cmd(
			act.createDoublyLinkedListNode,
			this.linkedListElemID[index],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
		);

		this.cmd(act.createLabel, labPushID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		if (this.size === 0) {
			this.highlight(2,0, 'addFirst')
			this.highlight(3,0, 'addFirst')
		} else {
			if (index === 0) {
				this.unhighlight(1, 0, 'addFirst')
				this.highlight(4, 0, 'addFirst')
				this.highlight(5, 0, 'addFirst')
			} else if (index === this.size) {
				this.unhighlight(1, 0, 'addLast')
				this.highlight(4, 0, 'addLast')
				this.highlight(5, 0, 'addLast')
			}
		}
		this.cmd(act.step);

		this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
		this.cmd(act.step);
		this.cmd(act.setText, this.linkedListElemID[index], elemToAdd);
		this.cmd(act.delete, labPushValID);


		if (index === 0) {
			this.cmd(act.setPrevNull, this.linkedListElemID[index], 1);
			this.cmd(act.connect, this.headID, this.linkedListElemID[index]);
		} else if (index === this.size) {
			this.cmd(act.setNextNull, this.linkedListElemID[index], 1);
			this.cmd(act.connect, this.tailID, this.linkedListElemID[index]);
		}

		if (this.size !== 0) {
			if (index === 0) {
				this.unhighlight(5, 0, 'addFirst')
				this.highlight(6, 0, 'addFirst')
				this.cmd(act.setPrevNull, this.linkedListElemID[index + 1], 0);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index],
					this.linkedListElemID[index + 1],
				);
				this.cmd(act.step);

				this.unhighlight(6, 0, 'addFirst')
				this.highlight(7, 0, 'addFirst')
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.step);

				this.unhighlight(7, 0, 'addFirst')
				this.highlight(8, 0, 'addFirst')
				this.cmd(act.disconnect, this.headID, this.linkedListElemID[index + 1]);
			} else if (index === this.size) {
				this.unhighlight(5, 0, 'addLast')
				this.highlight(6, 0, 'addLast')
				this.cmd(act.setNextNull, this.linkedListElemID[index - 1], 0);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.step);

				this.unhighlight(6, 0, 'addLast')
				this.highlight(7, 0, 'addLast')
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index],
					this.linkedListElemID[index - 1],
				);
				this.cmd(act.step);

				this.unhighlight(7, 0, 'addLast')
				this.highlight(8, 0, 'addLast')
				this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index - 1]);
			} else {
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index - 1],
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index],
					this.linkedListElemID[index - 1],
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
			}
		} else if (this.size === 0) {
			this.unhighlight(2, 0, 'addFirst')
			this.unhighlight(3, 0, 'addFirst')
			this.cmd(act.step);

			this.unhighlight(1, 0, 'addFirst')
		}
		this.cmd(act.step);

		if (index === 0) {
			this.unhighlight(4,0, 'addFirst')
			this.unhighlight(8, 0, 'addFirst')
			this.highlight(9, 0, 'addFirst')
		} else if (index === this.size) {
			this.unhighlight(4,0, 'addLast')
			this.unhighlight(8, 0, 'addLast')
			this.highlight(9, 0, 'addLast')
		}

		this.cmd(act.step);
		this.size = this.size + 1;
		this.resetNodePositions();
		this.cmd(act.delete, labPushID);

		if (index === 0) {
			this.unhighlight(0, 0, 'addFirst')
			this.unhighlight(9, 0, 'addFirst')
			this.highlight(10, 0, 'addFirst')
			this.cmd(act.step);
		} 

		if (index === this.size - 1) {
			this.unhighlight(0, 0, 'addLast')
			this.unhighlight(9, 0, 'addLast')
			this.highlight(10, 0, 'addLast')
			this.cmd(act.step);
		}

		if (index === 0) {
			this.unhighlight(10, 0, 'addFirst')
			this.cmd(act.step);
		} 
		
		if (index === this.size - 1) {
			this.unhighlight(10, 0, 'addLast')
			this.cmd(act.step);
		}

		return this.commands;
	}

	remove(index) {
		this.commands = [];

		index = parseInt(index);
		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		if (index === 0) {
			this.highlight(0, 0, 'removeFirst')
		} else if (index === this.size - 1) {
			this.highlight(0, 0, 'removeLast')
		}
		this.cmd(act.step);

		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		const nodePosX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * index;
		const nodePosY = LINKED_LIST_START_Y;
		this.cmd(act.createLabel, labPopID, 'Removed Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labPopValID, this.arrayData[index], nodePosX, nodePosY);
		this.cmd(act.move, labPopValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		if (index === 0) {
			this.highlight(1, 0, 'removeFirst')
		} else if (index === this.size - 1) {
			this.highlight(1, 0, 'removeLast')
		}
		this.cmd(act.step);
		
		if (index === 0) {
			this.unhighlight(1, 0, 'removeFirst')
			this.highlight(2, 0, 'removeFirst')
		} else if (index === this.size - 1) {
			this.unhighlight(1, 0, 'removeLast')
			this.highlight(2, 0, 'removeLast')
		}
		this.cmd(act.step);

		if (index === 0) {
			this.unhighlight(2, 0, 'removeFirst')
			this.highlight(3, 0, 'removeFirst')
		} else if (index === this.size) {
			this.unhighlight(2, 0, 'removeLast')
			this.highlight(3, 0, 'removeLast')
		}
		this.cmd(act.step);

		if (this.size !== 1) {
			if (index === 0) {
				this.unhighlight(3, 0, 'removeFirst')
				this.highlight(5, 0, 'removeFirst')
				this.highlight(6, 0, 'removeFirst')
				this.cmd(act.step);

				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.setPrevNull, this.linkedListElemID[index + 1], 1);
				this.cmd(act.disconnect, this.headID, this.linkedListElemID[index]);
				this.cmd(act.connect, this.headID, this.linkedListElemID[index + 1]);
			} else if (index === this.size - 1) {
				this.unhighlight(3, 0, 'removeLast')
				this.highlight(5, 0, 'removeLast')
				this.highlight(6, 0, 'removeLast')
				this.cmd(act.step);

				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.setNextNull, this.linkedListElemID[index - 1], 1);
				this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index]);
				this.cmd(act.connect, this.tailID, this.linkedListElemID[index - 1]);
			} else {
				const xPos =
					(index % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
					LINKED_LIST_START_X;
				const yPos = LINKED_LIST_START_Y - LINKED_LIST_ELEM_HEIGHT * 2;
				this.cmd(act.move, this.linkedListElemID[index], xPos, yPos);
				this.cmd(act.step);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index - 1],
				);
			}
		} else {
			if (index === 0) {
				this.highlight(4, 0, 'removeFirst')
			} else if (index === this.size - 1) {
				this.highlight(4, 0, 'removeLast')
			}
			this.cmd(act.step)
			this.cmd(act.disconnect, this.headID, this.linkedListElemID[index]);
			this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index]);

			if (index === 0) {
				this.unhighlight(4, 0, 'removeFirst')
			} else if (index === this.size - 1) {
				this.unhighlight(4, 0, 'removeLast')
			}
			this.cmd(act.step)
		}

		this.cmd(act.setText, this.leftoverLabelID, 'Removed Value: ');
		this.cmd(act.setText, this.leftoverValID, this.arrayData[index]);

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);

		this.cmd(act.delete, this.linkedListElemID[index]);

		if (index === 0) {
			this.unhighlight(5, 0, 'removeFirst')
			this.unhighlight(6, 0, 'removeFirst')
			this.highlight(7, 0, 'removeFirst')
			this.highlight(8, 0, 'removeFirst')
			this.cmd(act.step);
		} else if (index === this.size - 1) {
			this.unhighlight(5, 0, 'removeLast')
			this.unhighlight(6, 0, 'removeLast')
			this.highlight(7, 0, 'removeLast')
			this.highlight(8, 0, 'removeLast')
			this.cmd(act.step);
		}
		this.cmd(act.step);

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
			this.linkedListElemID[i] = this.linkedListElemID[i + 1];
		}

		if (index === 0) {
			this.unhighlight(7, 0, 'removeFirst')
			this.unhighlight(8, 0, 'removeFirst')
			this.highlight(9, 0, 'removeFirst')
			this.cmd(act.step);
		} else if (index === this.size - 1) {
			this.unhighlight(7, 0, 'removeLast')
			this.unhighlight(8, 0, 'removeLast')
			this.highlight(9, 0, 'removeLast')
			this.cmd(act.step);
		}
		this.cmd(act.step);

		this.size = this.size - 1;
		this.resetNodePositions();

		if (index === 0) {
			this.unhighlight(9, 0, 'removeFirst')
			this.unhighlight(0, 0, 'removeFirst')
		} else {
			this.unhighlight(9, 0, 'removeLast')
			this.unhighlight(0, 0, 'removeLast')
		}
		this.cmd(act.step)

		return this.commands;
	}

	resetNodePositions() {
		for (let i = 0; i < this.size; i++) {
			const nextX =
				(i % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
			const nextY =
				Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING +
				LINKED_LIST_START_Y;
			this.cmd(act.move, this.linkedListElemID[i], nextX, nextY);
		}
	}

	clearAll() {
		this.addField.value = '';
		this.commands = [];
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.linkedListElemID[i]);
		}
		this.size = 0;
		this.cmd(act.setNull, this.headID, 1);
		this.cmd(act.setNull, this.tailID, 1);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		return this.commands;
	}
}
