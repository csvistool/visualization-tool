import AnimationManager, { act } from '../AnimationMain';

describe('AnimationManager', () => {
	let mockContext;
	let canvasRef;
	let animBarRef;
	let controlBar;
	let mockSetHighlightState;
	let mockUnhighlightLine;
	let manager;

	beforeEach(() => {
		mockContext = {
			arc: jest.fn(),
			beginPath: jest.fn(),
			clearRect: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			fillText: jest.fn(),
			lineTo: jest.fn(),
			measureText: jest.fn(str => ({ width: str.length * 8 })),
			moveTo: jest.fn(),
			quadraticCurveTo: jest.fn(),
			stroke: jest.fn(),
			strokeText: jest.fn(),
		};

		const canvasElem = document.createElement('canvas');
		canvasElem.getContext = jest.fn(() => mockContext);
		canvasRef = { current: canvasElem };
		global.canvas = canvasElem;

		controlBar = document.createElement('div');
		controlBar.id = 'GeneralAnimationControls';
		document.body.appendChild(controlBar);

		const tableElem = document.createElement('table');
		const trElem = document.createElement('tr');
		tableElem.appendChild(trElem);
		document.body.appendChild(tableElem);
		animBarRef = { current: trElem };

		mockSetHighlightState = jest.fn();
		mockUnhighlightLine = jest.fn();

		manager = new AnimationManager(
			canvasRef,
			animBarRef,
			mockSetHighlightState,
			mockUnhighlightLine,
		);
		manager.currentBlock = [];
		manager.undoBlock = [];
		manager.objectManager.width = 800;
		manager.objectManager.height = 600;
	});

	afterEach(() => {
		if (manager) {
			manager.stopTimer();
		}
		document.body.innerHTML = '';
	});

	it('initializes with default controls, buttons, and listeners', () => {
		expect(manager.objectManager).toBeDefined();
		expect(manager.animatedObjects).toBe(manager.objectManager);
		expect(manager.animationPaused).toBe(false);
		expect(manager.awaitingStep).toBe(false);
		expect(manager.currentlyAnimating).toBe(false);
		expect(manager.skipBackButton).toBeDefined();
		expect(manager.stepBackButton).toBeDefined();
		expect(manager.playPauseBackButton).toBeDefined();
		expect(manager.stepForwardButton).toBeDefined();
		expect(manager.skipForwardButton).toBeDefined();
	});

	describe('Math and parsing utilities', () => {
		it('interpolates numbers with lerp', () => {
			expect(manager.lerp(10, 20, 0.5)).toBe(15);
			expect(manager.lerp(0, 100, 0)).toBe(0);
			expect(manager.lerp(0, 100, 1)).toBe(100);
		});

		it('parses boolean string representations', () => {
			expect(manager.parseBool('True')).toBe(true);
			expect(manager.parseBool('1')).toBe(true);
			expect(manager.parseBool('yes')).toBe(true);

			expect(manager.parseBool('0')).toBe(false);
			expect(manager.parseBool(' 0')).toBe(false);
			expect(manager.parseBool('')).toBe(false);
		});

		it('parses hex colors', () => {
			expect(manager.parseColor('#ff0000')).toBe('#ff0000');
			expect(manager.parseColor('0x00ff00')).toBe('#00ff00');
		});

		it('updates speed and calculates animation block length', () => {
			manager.setSpeed(75);
			expect(manager.animationBlockLength).toBe(12);

			manager.setSpeed(100);
			expect(manager.animationBlockLength).toBe(0);

			manager.setSpeed(0);
			expect(manager.animationBlockLength).toBe(50);
		});

		it('changes canvas and objectManager size and fires event', () => {
			const sizeListener = jest.fn();
			manager.addListener('CanvasSizeChanged', null, sizeListener);

			manager.changeSize(1024, 768);
			expect(manager.animatedObjects.width).toBe(1024);
			expect(manager.animatedObjects.height).toBe(768);
			expect(sizeListener).toHaveBeenCalledWith({ width: 1024, height: 768 });
		});
	});

	describe('Playback and step controls', () => {
		it('toggles play/pause state and updates button classes', () => {
			expect(manager.paused).toBe(false);

			manager.doPlayPause();
			expect(manager.paused).toBe(true);
			expect(manager.animationPaused).toBe(true);
			expect(manager.playPauseBackButton.value).toBe('Play');
			expect(manager.playPauseBackButton.classList.contains('play')).toBe(true);

			manager.doPlayPause();
			expect(manager.paused).toBe(false);
			expect(manager.animationPaused).toBe(false);
			expect(manager.playPauseBackButton.value).toBe('Pause');
			expect(manager.playPauseBackButton.classList.contains('pause')).toBe(true);
		});

		it('executes startNewAnimation, step transitions, and stops timer at completion', () => {
			const startedListener = jest.fn();
			const endedListener = jest.fn();
			manager.addListener('AnimationStarted', null, startedListener);
			manager.addListener('AnimationEnded', null, endedListener);

			const commands = [
				[act.createCircle, [1, 'A', 50, 50]],
				[act.step, []],
				[act.move, [1, 100, 100]],
				[act.step, []],
			];

			manager.startNewAnimation(commands);
			expect(startedListener).toHaveBeenCalled();
			expect(manager.currentlyAnimating).toBe(true);
			expect(manager.currentAnimation).toBe(2);

			// Fast-forward frame update
			manager.currFrame = manager.animationBlockLength;
			manager.update();

			// Execute step forward
			manager.awaitingStep = true;
			manager.step();
			expect(manager.currentlyAnimating).toBe(true);

			// Finish remaining blocks
			manager.startNextBlock();
			expect(manager.currentlyAnimating).toBe(false);
			expect(endedListener).toHaveBeenCalled();
		});

		it('handles stepBack and undoLastBlock across steps', () => {
			const commands = [
				[act.createCircle, [1, 'Node1', 50, 50]],
				[act.step, []],
				[act.move, [1, 150, 150]],
				[act.step, []],
			];

			manager.startNewAnimation(commands);
			manager.skipForward();
			expect(manager.currentlyAnimating).toBe(false);

			// stepBack
			manager.animationPaused = true;
			manager.awaitingStep = true;
			manager.stepBack();
			expect(manager.doingUndo).toBe(true);

			// Advance undo frames
			manager.currFrame = manager.animationBlockLength;
			manager.update();
		});

		it('handles skipBack and resets state back to beginning', () => {
			const commands = [
				[act.createCircle, [1, 'A', 50, 50]],
				[act.step, []],
				[act.move, [1, 150, 150]],
				[act.step, []],
			];

			manager.startNewAnimation(commands);
			manager.skipForward();
			expect(manager.animatedObjects.getNodeX(1)).toBe(150);

			manager.skipBack();
			expect(manager.currentlyAnimating).toBe(false);
		});

		it('clears history and resets all objects', () => {
			const undoUnavailableListener = jest.fn();
			manager.addListener('AnimationUndoUnavailable', null, undoUnavailableListener);

			manager.startNewAnimation([
				[act.createCircle, [1, 'A', 50, 50]],
				[act.step, []],
			]);
			manager.resetAll();

			expect(manager.undoStack).toEqual([]);
			expect(manager.animatedObjects.nodes).toEqual([]);
			expect(undoUnavailableListener).toHaveBeenCalled();
		});
	});

	describe('Action handlers (act)', () => {
		beforeEach(() => {
			manager.currentBlock = [];
			manager.undoBlock = [];
		});

		it('handles object creation actions', () => {
			act.createCircle.call(manager, [1, 'Circle1', 10, 20]);
			expect(manager.animatedObjects.getObject(1)).toBeDefined();

			act.createHighlightCircle.call(manager, [2, '#F00', 30, 40, 15]);
			expect(manager.animatedObjects.getObject(2)).toBeDefined();

			act.createRectangle.call(manager, [
				3,
				'Rect',
				50,
				30,
				60,
				70,
				'center',
				'center',
				'#FFF',
				'#000',
			]);
			expect(manager.animatedObjects.getObject(3)).toBeDefined();

			act.createLabel.call(manager, [4, 'Label1', 80, 90, true, false, false]);
			expect(manager.animatedObjects.getObject(4)).toBeDefined();

			act.createLinkedListNode.call(manager, [
				5,
				['LL'],
				60,
				30,
				100,
				110,
				0.25,
				false,
				true,
				'#FFF',
				'#000',
			]);
			expect(manager.animatedObjects.getObject(5)).toBeDefined();

			act.createDoublyLinkedListNode.call(manager, [
				6,
				'DLL',
				70,
				35,
				120,
				130,
				0.2,
				'#FFF',
				'#000',
			]);
			expect(manager.animatedObjects.getObject(6)).toBeDefined();

			act.createCircularlyLinkedListNode.call(manager, [
				7,
				'CLL',
				65,
				30,
				140,
				150,
				0.2,
				'#FFF',
				'#000',
			]);
			expect(manager.animatedObjects.getObject(7)).toBeDefined();

			act.createSkipListNode.call(manager, [8, 'SKL', 50, 25, 160, 170, '#FFF', '#000']);
			expect(manager.animatedObjects.getObject(8)).toBeDefined();

			act.createBTreeNode.call(manager, [9, 30, 20, 2, 180, 190, '#FFF', '#000']);
			expect(manager.animatedObjects.getObject(9)).toBeDefined();
		});

		it('handles text and color modification actions', () => {
			act.createCircle.call(manager, [1, 'OldText', 10, 10]);

			act.setText.call(manager, [1, 'NewText', 0]);
			expect(manager.animatedObjects.getText(1, 0)).toBe('NewText');

			act.setTextColor.call(manager, [1, '#112233', 0]);
			expect(manager.animatedObjects.getTextColor(1, 0)).toBe('#112233');

			act.setForegroundColor.call(manager, [1, '#445566']);
			expect(manager.animatedObjects.foregroundColor(1)).toBe('#445566');

			act.setBackgroundColor.call(manager, [1, '#778899']);
			expect(manager.animatedObjects.backgroundColor(1)).toBe('#778899');

			act.setHighlight.call(manager, [1, true, '#FF0000']);
			expect(manager.animatedObjects.getHighlight(1)).toBe(true);

			act.setAlpha.call(manager, [1, 0.6]);
			expect(manager.animatedObjects.getAlpha(1)).toBe(0.6);
		});

		it('handles position, dimension, and alignment actions', () => {
			act.createRectangle.call(manager, [
				1,
				'R1',
				50,
				30,
				100,
				100,
				'center',
				'center',
				'#FFF',
				'#000',
			]);
			act.createRectangle.call(manager, [
				2,
				'R2',
				40,
				20,
				200,
				200,
				'center',
				'center',
				'#FFF',
				'#000',
			]);

			act.setPosition.call(manager, [1, 120, 130]);
			expect(manager.animatedObjects.getNodeX(1)).toBe(120);
			expect(manager.animatedObjects.getNodeY(1)).toBe(130);

			act.move.call(manager, [1, 140, 150]);
			expect(manager.anyAnimations).toBe(true);
			expect(manager.currentBlock).toHaveLength(1);

			act.setWidth.call(manager, [1, 70]);
			act.setHeight.call(manager, [1, 35]);
			expect(manager.animatedObjects.getWidth(1)).toBe(70);
			expect(manager.animatedObjects.getHeight(1)).toBe(35);

			act.alignRight.call(manager, [2, 1]);
			act.alignLeft.call(manager, [2, 1]);
			act.alignTop.call(manager, [2, 1]);
			act.alignBottom.call(manager, [2, 1]);
			act.moveToAlignRight.call(manager, [2, 1]);
			expect(manager.currentBlock.length).toBeGreaterThan(1);
		});

		it('handles edge creation, edge modification, and disconnection', () => {
			act.createCircle.call(manager, [1, 'A', 50, 50]);
			act.createCircle.call(manager, [2, 'B', 150, 50]);

			act.connect.call(manager, [1, 2, '#000', 0, true, 'lab', 0, 1]);
			expect(manager.animatedObjects.edges[1]).toHaveLength(1);

			act.setEdgeColor.call(manager, [1, 2, '#FF0000']);
			act.setEdgeAlpha.call(manager, [1, 2, 0.5]);
			act.setEdgeHighlight.call(manager, [1, 2, true, '#00FF00']);
			act.setEdgeThickness.call(manager, [1, 2, 3]);

			act.disconnect.call(manager, [1, 2]);
			expect(manager.animatedObjects.edges[1]).toHaveLength(0);

			act.connectNext.call(manager, [1, 2]);
			act.connectPrev.call(manager, [1, 2]);
			act.connectCurve.call(manager, [1, 2, 0.4]);
			act.connectSkipList.call(manager, [1, 2, 1]);
		});

		it('handles specialized node operations and code highlights', () => {
			act.createRectangle.call(manager, [
				1,
				'R',
				50,
				30,
				50,
				50,
				'center',
				'center',
				'#FFF',
				'#000',
			]);
			act.setRectangleEdgeThickness.call(manager, [1, [true, false, true, false]]);
			act.bringToTop.call(manager, [1, true]);

			act.createLinkedListNode.call(manager, [
				2,
				['LL'],
				50,
				30,
				100,
				100,
				0.2,
				false,
				true,
				'#FFF',
				'#000',
			]);
			act.setNull.call(manager, [2, true]);

			act.createDoublyLinkedListNode.call(manager, [
				3,
				'DLL',
				50,
				30,
				150,
				150,
				0.2,
				'#FFF',
				'#000',
			]);
			act.setPrevNull.call(manager, [3, true]);
			act.setNextNull.call(manager, [3, true]);

			act.createBTreeNode.call(manager, [4, 30, 20, 2, 200, 200, '#FFF', '#000']);
			act.setNumElements.call(manager, [4, 4]);

			act.createLabel.call(manager, [5, 'Word', 250, 250, true, false, false]);
			act.setHighlightIndex.call(manager, [5, 2]);

			act.setLayer.call(manager, [1, 1]);

			// Code line highlight and unhighlight
			act.highlightCodeLine.call(manager, ['testMethod', 3]);
			expect(mockSetHighlightState).toHaveBeenCalledWith('testMethod', 3);

			act.unhighlightCodeLine.call(manager, ['testMethod', 3]);
			expect(mockUnhighlightLine).toHaveBeenCalledWith('testMethod', 3);

			// Connect nodes to test deleting incident edges
			act.createCircle.call(manager, [10, 'EdgeNode', 50, 50]);
			act.connect.call(manager, [1, 10]);

			// Delete object and edges
			act.delete.call(manager, [1]);
			expect(manager.animatedObjects.nodes[1]).toBeNull();
		});
	});

	describe('Layer methods and event handlers', () => {
		it('proxies layer modifications and updates canvas', () => {
			act.createCircle.call(manager, [1, 'A', 50, 50]);
			manager.setLayer(true, [0]);
			manager.toggleLayer(0);
			manager.updateLayer(0, true);
			manager.setAllLayers([0, 1]);

			expect(mockContext.clearRect).toHaveBeenCalled();
		});

		it('updates status report and buttons on animation event callbacks', () => {
			manager.animStarted();
			expect(manager.skipForwardButton.disabled).toBe(false);
			expect(manager.objectManager.statusReport.label).toBe('Animation Running');

			manager.animWaiting();
			expect(manager.stepForwardButton.disabled).toBe(false);
			expect(manager.objectManager.statusReport.label).toBe('Animation Paused');

			manager.animEnded();
			expect(manager.skipForwardButton.disabled).toBe(true);
			expect(manager.objectManager.statusReport.label).toBe('Animation Completed');

			manager.animUndoUnavailable();
			expect(manager.skipBackButton.disabled).toBe(true);
		});

		it('triggers timeout and advances frame animation', () => {
			jest.useFakeTimers();
			act.createCircle.call(manager, [1, 'Moving', 10, 10]);
			act.move.call(manager, [1, 100, 100]);
			manager.currentlyAnimating = true;

			manager.timeout();
			expect(mockContext.clearRect).toHaveBeenCalled();

			jest.clearAllTimers();
			jest.useRealTimers();
		});
	});
});
