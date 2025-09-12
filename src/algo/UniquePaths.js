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
	addDropDownGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const GRID_CELL_WIDTH = 50;
const GRID_CELL_HEIGHT = 50;
const GRID_START_X = 50;
const GRID_START_Y = 80;

const TREE_START_X = 450;
const TREE_START_Y = 100;
const TREE_NODE_WIDTH = 80;
const TREE_NODE_HEIGHT = 30;

const CODE_START_X = 25;
const CODE_START_Y = 350;

const MAX_GRID_SIZE = 8;

const CELL_DEFAULT_COLOR = '#FFFFFF';
const CELL_CURRENT_COLOR = '#FFD700';
const CELL_VISITED_COLOR = '#87CEEB';
const CELL_BASE_CASE_COLOR = '#98FB98';
const CELL_GOAL_COLOR = '#FFB6C1';
const PATH_COLOR = '#FF6347';

export default class UniquePaths extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar('Rows (m):');
		this.mField = addControlToAlgorithmBar('Text', '3');
		this.mField.onkeydown = this.returnSubmit(
			this.mField,
			this.runCallback.bind(this),
			2,
			true,
		);
		this.controls.push(this.mField);

		addLabelToAlgorithmBar('Cols (n):');
		this.nField = addControlToAlgorithmBar('Text', '3');
		this.nField.onkeydown = this.returnSubmit(
			this.nField,
			this.runCallback.bind(this),
			2,
			true,
		);
		this.controls.push(this.nField);

		addLabelToAlgorithmBar('Mode:');
		this.modeDropdown = addDropDownGroupToAlgorithmBar(
			[
				['recursion', 'Pure Recursion'],
				['memoized', 'Memoized'],
				['dp', 'Bottom-up DP'],
			],
			'Mode',
		);
		this.controls.push(this.modeDropdown);

		this.runButton = addControlToAlgorithmBar('Button', 'Run');
		this.runButton.onclick = this.runCallback.bind(this);
		this.controls.push(this.runButton);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.code = [
			['function ', 'uniquePaths(m, n, i=0, j=0):'],
			['  if ', 'i == m-1 and j == n-1:'],
			['    return ', '1'],
			['  if ', 'i >= m or j >= n:'],
			['    return ', '0'],
			['  return ', 'uniquePaths(m,n,i+1,j) + uniquePaths(m,n,i,j+1)'],
		];

		this.codeID = this.addCodeToCanvasBase(this.code, CODE_START_X, CODE_START_Y);

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.initialIndex = this.nextIndex;
		this.oldIDs = [];
		this.commands = [];
	}

	reset() {
		this.oldIDs = [];
		this.nextIndex = this.initialIndex;
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear(keepInput) {
		this.commands = [];

		if (!keepInput) {
			this.mField.value = '3';
			this.nField.value = '3';
		}

		this.clearOldIDs();
		return this.commands;
	}

	runCallback() {
		this.implementAction(this.clear.bind(this), true);
		const m = parseInt(this.mField.value);
		const n = parseInt(this.nField.value);
		const mode = this.modeDropdown.value;
		this.implementAction(this.run.bind(this), m, n, mode);
	}

	run(m, n, mode) {
		this.commands = [];

		if (!m || !n || m < 1 || n < 1 || m > MAX_GRID_SIZE || n > MAX_GRID_SIZE) {
			this.shake(this.runButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				`Grid dimensions must be between 1 and ${MAX_GRID_SIZE}`,
			);
			return this.commands;
		}

		this.m = m;
		this.n = n;
		this.mode = mode;

		this.buildGrid(m, n);

		switch (mode) {
			case 'recursion':
				this.solveRecursive();
				break;
			case 'memoized':
				this.solveMemoized();
				break;
			case 'dp':
				this.solveDP();
				break;
			default:
				this.solveRecursive();
				break;
		}

		return this.commands;
	}

	buildGrid(m, n) {
		this.gridID = new Array(m);
		this.gridValues = new Array(m);
		this.gridXPos = new Array(m);
		this.gridYPos = new Array(m);

		for (let i = 0; i < m; i++) {
			this.gridID[i] = new Array(n);
			this.gridValues[i] = new Array(n);
			this.gridXPos[i] = new Array(n);
			this.gridYPos[i] = new Array(n);

			for (let j = 0; j < n; j++) {
				this.gridID[i][j] = this.nextIndex++;
				this.gridValues[i][j] = 0;
				this.oldIDs.push(this.gridID[i][j]);

				this.gridXPos[i][j] = GRID_START_X + j * GRID_CELL_WIDTH;
				this.gridYPos[i][j] = GRID_START_Y + i * GRID_CELL_HEIGHT;

				this.cmd(
					act.createRectangle,
					this.gridID[i][j],
					'',
					GRID_CELL_WIDTH,
					GRID_CELL_HEIGHT,
					this.gridXPos[i][j],
					this.gridYPos[i][j],
				);
				this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_DEFAULT_COLOR);
			}
		}

		this.cmd(act.setBackgroundColor, this.gridID[0][0], PATH_COLOR);
		this.cmd(act.setBackgroundColor, this.gridID[m - 1][n - 1], CELL_GOAL_COLOR);

		const startLabelID = this.nextIndex++;
		const endLabelID = this.nextIndex++;
		this.oldIDs.push(startLabelID, endLabelID);

		this.cmd(
			act.createLabel,
			startLabelID,
			'START',
			this.gridXPos[0][0],
			this.gridYPos[0][0] - 25,
			0,
		);
		this.cmd(
			act.createLabel,
			endLabelID,
			'END',
			this.gridXPos[m - 1][n - 1],
			this.gridYPos[m - 1][n - 1] - 25,
			0,
		);

		this.cmd(act.step);
	}

	solveRecursive() {
		this.cmd(act.setText, this.infoLabelID, 'Starting pure recursive solution...');
		this.cmd(act.step);

		this.recursionDepth = 0;
		this.treeNodes = [];
		this.callCount = 0;

		const result = this.uniquePathsRecursive(0, 0);

		this.cmd(act.setText, this.infoLabelID, `Total unique paths: ${result}`);
		this.cmd(act.setText, this.gridID[this.m - 1][this.n - 1], result);
		this.cmd(act.step);
	}

	uniquePathsRecursive(i, j) {
		this.callCount++;
		
		this.cmd(act.setHighlight, this.gridID[i][j], 1);
		this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_CURRENT_COLOR);
		
		const nodeID = this.nextIndex++;
		this.oldIDs.push(nodeID);
		
		const nodeX = TREE_START_X + this.recursionDepth * 100;
		const nodeY = TREE_START_Y + this.treeNodes.length * 40;
		
		this.cmd(
			act.createRectangle,
			nodeID,
			`(${i},${j})`,
			TREE_NODE_WIDTH,
			TREE_NODE_HEIGHT,
			nodeX,
			nodeY,
		);
		this.cmd(act.setBackgroundColor, nodeID, CELL_CURRENT_COLOR);
		
		this.treeNodes.push(nodeID);
		this.cmd(act.setText, this.infoLabelID, `Recursive call: uniquePaths(${i}, ${j})`);
		
		this.highlight(0, 0);
		this.cmd(act.step);
		this.unhighlight(0, 0);

		if (i === this.m - 1 && j === this.n - 1) {
			this.highlight(1, 0);
			this.highlight(2, 0);
			this.cmd(act.setText, this.infoLabelID, `Base case: reached destination (${i}, ${j}) = 1`);
			this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_BASE_CASE_COLOR);
			this.cmd(act.setText, nodeID, `(${i},${j}): 1`);
			this.cmd(act.setBackgroundColor, nodeID, CELL_BASE_CASE_COLOR);
			this.cmd(act.step);
			this.unhighlight(1, 0);
			this.unhighlight(2, 0);
			
			this.cmd(act.setHighlight, this.gridID[i][j], 0);
			this.gridValues[i][j] = 1;
			return 1;
		}

		if (i >= this.m || j >= this.n) {
			this.highlight(3, 0);
			this.highlight(4, 0);
			this.cmd(act.setText, this.infoLabelID, `Base case: out of bounds (${i}, ${j}) = 0`);
			this.cmd(act.setText, nodeID, `(${i},${j}): 0`);
			this.cmd(act.setBackgroundColor, nodeID, '#FFB6B6');
			this.cmd(act.step);
			this.unhighlight(3, 0);
			this.unhighlight(4, 0);
			
			if (i < this.m && j < this.n) {
				this.cmd(act.setHighlight, this.gridID[i][j], 0);
			}
			return 0;
		}

		this.highlight(5, 0);
		this.cmd(act.setText, this.infoLabelID, `Exploring paths from (${i}, ${j})`);
		this.cmd(act.step);

		this.recursionDepth++;
		const downPaths = this.uniquePathsRecursive(i + 1, j);
		const rightPaths = this.uniquePathsRecursive(i, j + 1);
		this.recursionDepth--;

		const totalPaths = downPaths + rightPaths;
		
		this.cmd(act.setText, this.infoLabelID, `(${i}, ${j}): ${downPaths} + ${rightPaths} = ${totalPaths}`);
		this.cmd(act.setText, nodeID, `(${i},${j}): ${totalPaths}`);
		this.cmd(act.setBackgroundColor, nodeID, CELL_VISITED_COLOR);
		this.cmd(act.setText, this.gridID[i][j], totalPaths);
		this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_VISITED_COLOR);
		this.cmd(act.step);
		
		this.unhighlight(5, 0);
		this.cmd(act.setHighlight, this.gridID[i][j], 0);
		
		this.gridValues[i][j] = totalPaths;
		return totalPaths;
	}

	solveMemoized() {
		this.cmd(act.setText, this.infoLabelID, 'Starting memoized solution...');
		this.cmd(act.step);

		this.memo = {};
		this.recursionDepth = 0;
		this.treeNodes = [];
		this.callCount = 0;

		const result = this.uniquePathsMemoized(0, 0);

		this.cmd(act.setText, this.infoLabelID, `Total unique paths (memoized): ${result}`);
		this.cmd(act.setText, this.gridID[this.m - 1][this.n - 1], result);
		this.cmd(act.step);
	}

	uniquePathsMemoized(i, j) {
		const key = `${i},${j}`;
		
		if (this.memo[key] !== undefined) {
			this.cmd(act.setHighlight, this.gridID[i][j], 1);
			this.cmd(act.setBackgroundColor, this.gridID[i][j], '#DDA0DD');
			this.cmd(act.setText, this.infoLabelID, `Cache hit: (${i}, ${j}) = ${this.memo[key]}`);
			this.cmd(act.step);
			this.cmd(act.setHighlight, this.gridID[i][j], 0);
			return this.memo[key];
		}

		this.callCount++;
		
		this.cmd(act.setHighlight, this.gridID[i][j], 1);
		this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_CURRENT_COLOR);
		
		const nodeID = this.nextIndex++;
		this.oldIDs.push(nodeID);
		
		const nodeX = TREE_START_X + this.recursionDepth * 100;
		const nodeY = TREE_START_Y + this.treeNodes.length * 40;
		
		this.cmd(
			act.createRectangle,
			nodeID,
			`(${i},${j})`,
			TREE_NODE_WIDTH,
			TREE_NODE_HEIGHT,
			nodeX,
			nodeY,
		);
		this.cmd(act.setBackgroundColor, nodeID, CELL_CURRENT_COLOR);
		
		this.treeNodes.push(nodeID);
		this.cmd(act.setText, this.infoLabelID, `Computing: uniquePaths(${i}, ${j})`);
		this.cmd(act.step);

		let result;

		if (i === this.m - 1 && j === this.n - 1) {
			this.cmd(act.setText, this.infoLabelID, `Base case: reached destination (${i}, ${j}) = 1`);
			this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_BASE_CASE_COLOR);
			this.cmd(act.setText, nodeID, `(${i},${j}): 1`);
			this.cmd(act.setBackgroundColor, nodeID, CELL_BASE_CASE_COLOR);
			result = 1;
		} else if (i >= this.m || j >= this.n) {
			this.cmd(act.setText, this.infoLabelID, `Base case: out of bounds (${i}, ${j}) = 0`);
			this.cmd(act.setText, nodeID, `(${i},${j}): 0`);
			this.cmd(act.setBackgroundColor, nodeID, '#FFB6B6');
			result = 0;
		} else {
			this.recursionDepth++;
			const downPaths = this.uniquePathsMemoized(i + 1, j);
			const rightPaths = this.uniquePathsMemoized(i, j + 1);
			this.recursionDepth--;

			result = downPaths + rightPaths;
			
			this.cmd(act.setText, this.infoLabelID, `(${i}, ${j}): ${downPaths} + ${rightPaths} = ${result}`);
			this.cmd(act.setText, nodeID, `(${i},${j}): ${result}`);
			this.cmd(act.setBackgroundColor, nodeID, CELL_VISITED_COLOR);
			this.cmd(act.setText, this.gridID[i][j], result);
			this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_VISITED_COLOR);
		}

		this.memo[key] = result;
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.gridID[i][j], 0);
		
		this.gridValues[i][j] = result;
		return result;
	}

	solveDP() {
		this.cmd(act.setText, this.infoLabelID, 'Starting bottom-up DP solution...');
		this.cmd(act.step);

		for (let i = 0; i < this.m; i++) {
			for (let j = 0; j < this.n; j++) {
				this.cmd(act.setHighlight, this.gridID[i][j], 1);
				this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_CURRENT_COLOR);
				
				let paths;
				if (i === 0 && j === 0) {
					paths = 1;
					this.cmd(act.setText, this.infoLabelID, `Base case: Starting position (0, 0) = 1`);
				} else if (i === 0) {
					paths = this.gridValues[i][j - 1];
					this.cmd(act.setText, this.infoLabelID, `Top row: (${i}, ${j}) = left cell = ${paths}`);
				} else if (j === 0) {
					paths = this.gridValues[i - 1][j];
					this.cmd(act.setText, this.infoLabelID, `Left column: (${i}, ${j}) = top cell = ${paths}`);
				} else {
					const fromTop = this.gridValues[i - 1][j];
					const fromLeft = this.gridValues[i][j - 1];
					paths = fromTop + fromLeft;
					this.cmd(act.setText, this.infoLabelID, `(${i}, ${j}): ${fromTop} + ${fromLeft} = ${paths}`);
				}

				this.gridValues[i][j] = paths;
				this.cmd(act.setText, this.gridID[i][j], paths);
				this.cmd(act.setBackgroundColor, this.gridID[i][j], CELL_VISITED_COLOR);
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.gridID[i][j], 0);
			}
		}

		const result = this.gridValues[this.m - 1][this.n - 1];
		this.cmd(act.setText, this.infoLabelID, `Total unique paths (DP): ${result}`);
		this.cmd(act.setBackgroundColor, this.gridID[this.m - 1][this.n - 1], CELL_GOAL_COLOR);
		this.cmd(act.step);
	}

	clearOldIDs() {
		for (let i = 0; i < this.oldIDs.length; i++) {
			this.cmd(act.delete, this.oldIDs[i]);
		}
		this.oldIDs = [];
		this.nextIndex = this.initialIndex;
		this.cmd(act.setText, this.infoLabelID, '');
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
}