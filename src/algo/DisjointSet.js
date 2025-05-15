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
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL David Galles OR
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
    addCheckboxToAlgorithmBar,
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
    addGroupToAlgorithmBar,
    addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

let ARRAY_START_X = 50;
let ARRAY_WIDTH = 30;
let ARRAY_HEIGHT = 30;

let TREE_START_X = 50;
let TREE_START_Y = 450;
let TREE_ELEM_WIDTH = 50;
let TREE_ELEM_HEIGHT = 50; 
let ARRAY_START_Y = 500;

let SIZE = 16;

let LINK_COLOR = '#000000';
let HIGHLIGHT_CIRCLE_COLOR = '#007700';
let FOREGROUND_COLOR = '#000000';
let BACKGROUND_COLOR = '#FFFFFF';
let PRINT_COLOR = '#007700';



export default class DisjointSet extends Algorithm {
    constructor(am, w, h){
        super(am, w, h)
        this.addControls();

        this.commands = [];
        this.nextIndex = 0;
        this.highlight1ID = this.nextIndex++;
        this.highlight2ID = this.nextIndex++;
        
        this.arrayID = new Array(SIZE);
        this.arrayLabelID = new Array(SIZE);
        this.treeID = new Array(SIZE);
        this.setData = new Array(SIZE);
        this.treeY = new Array(SIZE);
        this.treeIndexToLocation = new Array(SIZE);
        this.locationToTreeIndex = new Array(SIZE);
        this.heights = new Array(SIZE);
        for (let i = 0; i < SIZE; i++)
        {
            this.treeIndexToLocation[i] = i;
            this.locationToTreeIndex[i] = i;
            this.arrayID[i]= this.nextIndex++;
            this.arrayLabelID[i]= this.nextIndex++;
            this.treeID[i] = this.nextIndex++;
            this.setData[i] = -1;
            this.treeY[i] =  TREE_START_Y;
            this.heights[i] = 0;
        }
        
        this.pathCompression = false;
        this.unionByRank = false;
        this.rankAsHeight = false;
        this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
        this.setup();	
    }

    addControls(){
        this.controls = [];

        const putVerticalGroup = addGroupToAlgorithmBar(false);
		const putTopHorizontalGroup = addGroupToAlgorithmBar(true, putVerticalGroup);
		const putBottomHorizontalGroup = addGroupToAlgorithmBar(true, putVerticalGroup);

        addLabelToAlgorithmBar(`First: ${'\u00A0'.repeat(2)}`, putTopHorizontalGroup);
		this.union1Field = addControlToAlgorithmBar('Text', '', putTopHorizontalGroup);
		this.union1Field.onkeydown = this.returnSubmit(
			this.union1Field,
			this.unionCallback.bind(this),
            4,
			true,
		);
		this.controls.push(this.union1Field);

		addLabelToAlgorithmBar('Second: ', putBottomHorizontalGroup);
		this.union2Field = addControlToAlgorithmBar('Text', '', putBottomHorizontalGroup);
		this.union2Field.onkeydown = this.returnSubmit(
			this.union2Field,
			this.unionCallback.bind(this),
            4,
			false,
		);
		this.controls.push(this.union2Field);

		this.unionButton = addControlToAlgorithmBar('Button', 'Union');
		this.unionButton.onclick = this.unionCallback.bind(this);
		this.controls.push(this.unionButton);

        addDivisorToAlgorithmBar();

        this.findField = addControlToAlgorithmBar('Text', '');
        this.findField.style.textAlign = 'center';
        this.findField.onkeydown = this.returnSubmit(
            this.findField,
            this.findCallback.bind(this),
            4,
            true,
        );

        this.findButton = addControlToAlgorithmBar('Button', 'Find');
        this.findButton.onclick = this.findCallback.bind(this);
        this.controls.push(this.findField);
        this.controls.push(this.findButton);


        addDivisorToAlgorithmBar();

        this.pathCompressionBox = addCheckboxToAlgorithmBar("Path Compression");
        this.pathCompressionBox.onclick = this.pathCompressionChangeCallback.bind(this);

        this.controls.push(this.pathCompressionBox);

        addDivisorToAlgorithmBar();

        this.unionByRankBox = addCheckboxToAlgorithmBar("Union By Rank");
        this.unionByRankBox.onclick = this.unionByRankChangeCallback.bind(this);
        
        this.controls.push(this.unionByRankBox);

        addDivisorToAlgorithmBar();

        let radioButtonList = addRadioButtonGroupToAlgorithmBar(["Rank = # of nodes", 
        "Rank = estimated height", 
        ], 
        "RankType");
        this.rankNumberOfNodesButton = radioButtonList[0];
        this.rankNumberOfNodesButton.onclick = this.rankTypeChangedCallback.bind(this, false);
        this.controls.push(this.rankNumberOfNodesButton);


        this.rankEstimatedHeightButton = radioButtonList[1];
        this.rankEstimatedHeightButton.onclick = this.rankTypeChangedCallback.bind(this, true);
        this.controls.push(this.rankEstimatedHeightButton);

        this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
        this.rankEstimatedHeightButton.checked = this.rankAsHeight;
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
		dataList.forEach(dataEntry => {
			this.pushField.value = dataEntry.substring(0, 4);
			this.pushCallback();
			this.cmd(act.skipForward);
			this.animationManager.clearHistory();
		});
	}

    setup(){
        this.commands = new Array();

        for (let i = 0; i < SIZE; i++)
        {
            this.cmd(act.createRectangle, this.arrayID[i], this.setData[i], ARRAY_WIDTH, ARRAY_HEIGHT, ARRAY_START_X + i *ARRAY_WIDTH, ARRAY_START_Y);
            this.cmd(act.createLabel, this.arrayLabelID[i],  i,  ARRAY_START_X + i *ARRAY_WIDTH, ARRAY_START_Y + ARRAY_HEIGHT);
            this.cmd(act.setForegroundColor, this.arrayLabelID[i], "#0000FF");
    
            this.cmd(act.createCircle, this.treeID[i], i,  TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);
            this.cmd(act.setForegroundColor,  this.treeID[i], FOREGROUND_COLOR);
            this.cmd(act.setBackgroundColor,  this.treeID[i], BACKGROUND_COLOR);
            
        }
        this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
    }

    reset(){
        for (let i = 0; i < SIZE; i++)
        {
            this.setData[i] = -1;
        }
        this.pathCompression = false;
        this.unionByRank = false;
        this.rankAsHeight = false;
        this.pathCompressionBox.selected = this.pathCompression;
        this.unionByRankBox.selected = this.unionByRank;
        this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
        this.rankEstimatedHeightButton.checked = this.rankAsHeight;
    }
    
    rankTypeChangedCallback(rankAsHeight){
        if (this.rankAsHeight != rankAsHeight)
        {
                this.implementAction(this.changeRankType.bind(this),  rankAsHeight);
        }
    }

    pathCompressionChangeCallback(){
        if (this.pathCompression != this.pathCompressionBox.checked)
	    {
		this.implementAction(this.changePathCompression.bind(this), this.pathCompressionBox.checked);
    	}
    }

    unionByRankChangeCallback(){
        if (this.unionByRank != this.unionByRankBox.checked)
        {
            this.implementAction(this.changeUnionByRank.bind(this), this.unionByRankBox.checked);
        }
    }

    changeRankType(newValue){
        this.commands = new Array();
        this.rankAsHeight = newValue		
        if (this.rankNumberOfNodesButton.checked == this.rankAsHeight)
        {
            this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
        }
        if (this.rankEstimatedHeightButton.checked != this.rankAsHeight)
        {
            this.rankEstimatedHeightButton.checked = this.rankAsHeight;
        }
        // When we change union by rank, we can either create a blank slate using clearAll,
        // or we can rebuild the root values to what they shoue be given the current state of
        // the tree.  
        // clearAll();
        this.rebuildRootValues();
        return this.commands;	
    }

    changeUnionByRank(newValue){
        this.commands = new Array();
        this.cmd(act.step);
        this.pathCompression = newValue;
        if (this.pathCompressionBox.selected != this.pathCompression)
        {
            this.pathCompressionBox.selected = this.pathCompression;
        }
            this.rebuildRootValues();
        // clearAll();
        return this.commands;	
    }

    changePathCompression(newValue){
        this.commands = new Array();
        this.cmd(act.step);
        this.pathCompression = newValue;
        if (this.pathCompressionBox.selected != this.pathCompression)
        {
            this.pathCompressionBox.selected = this.pathCompression;
        }
            this.rebuildRootValues();
        // clearAll();
        return this.commands;		
    }

    findCallback(){	
        let findValue = this.findField.value;
        if (findValue != "" && parseInt(findValue) < SIZE)
        {
            this.findField.value = "";
            this.implementAction(this.findElement.bind(this), findValue);
        }
    }

    clearCallback(){
        this.implementAction(this.clearData.bind(this), "");
    }

    clearData(){
        this.commands = new Array();
        this.clearAll();
        return this.commands;	
    }

    getSizes(){
        let sizes = new Array(SIZE);
	
        for (let i = 0; i < SIZE; i++)
        {
            sizes[i] = 1;				
        }
        let changed = true;
        while (changed)
        {
            changed = false;
            for (let i = 0; i < SIZE; i++)
            {
                if (sizes[i] > 0 && this.setData[i] >= 0)
                {
                    sizes[this.setData[i]] += sizes[i];
                    sizes[i] = 0;
                    changed = true;
                }					
            }				
        }
        return sizes;
    }

    rebuildRootValue(){
        let changed = false;
	
        if (this.unionByRank)
        {
            let sizes;
            if (!this.rankAsHeight)
            {
                sizes = this.getSizes();
            }
            for (let i = 0; i < SIZE; i++)
            {
                if (this.setData[i] < 0)
                {
                    if (this.rankAsHeight)
                    {						
                        this.setData[i] = 0 - this.heights[i] - 1;
                    }
                    else
                    {
                        this.setData[i] = - sizes[i];
                    }
                }
            }
        }
        else
        {
            for (let i = 0; i < SIZE; i++)
            {
                if (this.setData[i] < 0)
                {
                    this.setData[i] = -1;
                }
            }
        }
        for (let i = 0; i < SIZE; i++)
        {
            this.cmd(act.setText, this.arrayID[i], this.setData[i]);
        }
    }

    unionCallback(){
        let union1 = this.union1Field.value;
        let union2 = this.union2Field.value;
        
        
        if ( union1 != "" && parseInt(union1) < SIZE && 
             union2 != "" && parseInt(union2) < SIZE)
        {
            this.union1Field.value = "";
            this.union2Field.value = "";
            this.implementAction(this.doUnion.bind(this), union1 + ";" + union2);		
        }
    }

    clearAll(){
        for (let i = 0; i < SIZE; i++)
        {
            if (this.setData[i] >= 0)
            {
                this.cmd(act.disconnect, this.treeID[i], this.treeID[this.setData[i]]);
            }
            this.setData[i] = -1;
            this.cmd(act.setText, this.arrayID[i], this.setData[i]);
            this.treeIndexToLocation[i] = i;
            this.locationToTreeIndex[i] = i;
            this.treeY[i] =  TREE_START_Y;
            this.cmd(act.setPosition, this.treeID[i], TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);				
        }
        
    }

    findElement(findValue){
        this.commands = new Array();
	

        let found = this.doFind(parseInt(findValue));
        
        if (this.pathCompression)
        {
            let changed = this.adjustHeights();
            if (changed)
            {
                this.animateNewPositions();
            }
        }
        return this.commands;
    }

    doFind(elem){
        this.cmd(act.setHighlight, this.treeID[elem], 1);
        this.cmd(act.setHighlight, this.arrayID[elem], 1);
        this.cmd(act.step);
        this.cmd(act.setHighlight, this.treeID[elem], 0);
        this.cmd(act.setHighlight, this.arrayID[elem], 0);
        if (this.setData[elem] >= 0)
        {
            let treeRoot = this.doFind(this.setData[elem]);
            if (this.pathCompression)
            {
                if (this.setData[elem] != treeRoot)
                {
                    this.cmd(act.disconnect, this.treeID[elem], this.treeID[this.setData[elem]]);
                    this.setData[elem] = treeRoot;
                    this.cmd(act.setText, this.arrayID[elem], this.setData[elem]);
                    this.cmd(act.connect, this.treeID[elem],
                                   this.treeID[treeRoot],
                                   FOREGROUND_COLOR, 
                                   0, // Curve
                                   1, // Directed
                                   ""); // Label
                }
            }				
            return treeRoot;
        }
        else
        {
            return elem;
        }
    }

    findRoot(elem){
        while (this.setData[elem] >= 0)
		elem = this.setData[elem];
	    return elem;		
    }

    adjustXPos(pos1, pos2){
        let left1 = this.treeIndexToLocation[pos1];
        while (left1 > 0 && this.findRoot(this.locationToTreeIndex[left1 - 1]) == pos1)
        {
            left1--;
        }
        let right1 = this.treeIndexToLocation[pos1];
        while (right1 < SIZE - 1 && this.findRoot(this.locationToTreeIndex[right1 + 1]) == pos1)
        {
            right1++;
        }
        let left2 = this.treeIndexToLocation[pos2];
        while (left2 > 0 && this.findRoot(this.locationToTreeIndex[left2-1]) == pos2)
        {
            left2--;
        }
        let right2 = this.treeIndexToLocation[pos2];
        while (right2 < SIZE - 1 && this.findRoot(this.locationToTreeIndex[right2 + 1]) == pos2)
        {
            right2++;
        }
        if (right1 == left2-1)
        {
            return false;
        }
        
        let tmpLocationToTreeIndex = new Array(SIZE);
        let nextInsertIndex = 0;
        for (let i = 0; i <= right1; i++)
        {
            tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
        }
        for (let i = left2; i <= right2; i++)
        {
            tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
        }
        for (let i = right1+1; i < left2; i++)
        {
            tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];				
        }
        for (let i = right2+1; i < SIZE; i++)
        {
            tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
        }
        for (let i = 0; i < SIZE; i++)
        {
            this.locationToTreeIndex[i] = tmpLocationToTreeIndex[i];
        }
        for (let i = 0; i < SIZE; i++)
        {
            this.treeIndexToLocation[this.locationToTreeIndex[i]] = i;
        }
        return true;
    }

    doUnion(value){
        this.commands = new Array();
        let args = value.split(";");
        let arg1 = this.doFind(parseInt(args[0]));
    
        this.cmd(act.createHighlightCircle, this.highlight1ID, HIGHLIGHT_CIRCLE_COLOR, TREE_START_X + this.treeIndexToLocation[arg1] * TREE_ELEM_WIDTH, this.treeY[arg1]);
    
        
        let arg2 = this.doFind(parseInt(args[1]));
        this.cmd(act.createHighlightCircle, this.highlight2ID, HIGHLIGHT_CIRCLE_COLOR, TREE_START_X + this.treeIndexToLocation[arg2] * TREE_ELEM_WIDTH, this.treeY[arg2]);
        
        
        if (arg1 == arg2)
        {
            this.cmd(act.delete, this.highlight1ID);
            this.cmd(act.delete, this.highlight2ID);
            return this.commands;
        }
        
        let changed;
        
        if (this.treeIndexToLocation[arg1] < this.treeIndexToLocation[arg2])
        {
            changed = this.adjustXPos(arg1, arg2) || changed
        }
        else
        {
            changed = this.adjustXPos(arg2, arg1) || changed
        }
        
        
        if (this.unionByRank && this.setData[arg1] < this.setData[arg2])
        {
            let tmp = arg1;
            arg1 = arg2;
            arg2 = tmp;
        }
    
        if (this.unionByRank && this.rankAsHeight)
        {
            if (this.setData[arg2] == this.setData[arg1])
            {
                this.setData[arg2] -= 1;
            }
        }
        else if (this.unionByRank)
        {
            this.setData[arg2] = this.setData[arg2] + this.setData[arg1];				
        }
        
        this.setData[arg1] = arg2;
        
        this.cmd(act.setText, this.arrayID[arg1], this.setData[arg1]);
        this.cmd(act.setText, this.arrayID[arg2], this.setData[arg2]);
        
        this.cmd(act.connect, this.treeID[arg1],
                       this.treeID[arg2],
                       FOREGROUND_COLOR, 
                           0, // Curve
                           1, // Directed
                           ""); // Label
        
        if (this.adjustHeights())
        {
            changed = true;
        }
                
        if (changed)
        {
            this.cmd(act.step);
            this.cmd(act.delete, this.highlight1ID);
            this.cmd(act.delete, this.highlight2ID);
            this.animateNewPositions();
        }
        else
        {
            this.cmd(act.delete, this.highlight1ID);
            this.cmd(act.delete, this.highlight2ID);		
        }
        
        return this.commands;
    }

    adjustHeights(){
        let changed = false;
        for (let i = 0; i < SIZE; i++)
        {
            this.heights[i] = 0;
        }
        
        for (let j = 0; j < SIZE; j++)
        {
            for (let i = 0; i < SIZE; i++)
            {
                if (this.setData[i] >= 0)
                {
                    this.heights[this.setData[i]] = Math.max(this.heights[this.setData[i]], this.heights[i] + 1);
                }
                
            }
        }
        for (let j = 0; j < SIZE; j++)
        {
            for (let i = 0; i < SIZE; i++)
            {
                if (this.setData[i] >= 0)
                {
                    this.heights[i] = this.heights[this.setData[i]] - 1;
                }
                
            }
        }
        for (let i = 0; i < SIZE; i++)
        {
            let newY = TREE_START_Y - this.heights[i] * TREE_ELEM_HEIGHT;
            if (this.treeY[i] != newY)
            {
                this.treeY[i] = newY;
                changed = true;
            }
        }
        return changed;
    }

    animateNewPositions(){
        for (let i = 0; i < SIZE; i++)
        {
            this.cmd(act.move, this.treeID[i], TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);
        }
    }
}