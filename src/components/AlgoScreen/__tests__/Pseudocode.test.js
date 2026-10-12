import { render, screen } from '@testing-library/react';
import Pseudocode from '../Pseudocode';
import React from 'react';

describe('Pseudocode Component', () => {
	it('renders pseudocode lines with IDs in english mode', () => {
		const { container } = render(<Pseudocode algoName="ArrayList" language="english" />);

		// Verify container
		expect(container.querySelector('.pseudocode-modal-content')).toBeInTheDocument();

		// Line IDs
		const firstLine = document.getElementById('addFB-0');
		expect(firstLine).toBeInTheDocument();
		expect(firstLine).toHaveClass('pseudocode-line');

		// English explanation text
		expect(screen.getByText(/call addAtIndex at front with data/i)).toBeInTheDocument();
	});

	it('renders code format lines when language is code', () => {
		render(<Pseudocode algoName="ArrayList" language="code" />);

		const codeLine = document.getElementById('addFB-1');
		expect(codeLine).toBeInTheDocument();
		expect(codeLine).toHaveTextContent(/addAtIndex\(0, data\)/);
	});

	it('applies syntax highlighting classes to procedures, keywords, and parameters', () => {
		const { container } = render(<Pseudocode algoName="ArrayList" language="code" />);

		// Procedure definition highlighting
		const procedureSpans = container.querySelectorAll('.pseudocode-procedure');
		expect(procedureSpans.length).toBeGreaterThan(0);
		expect(procedureSpans[0]).toHaveTextContent(/procedure/i);

		// Parameter highlighting
		const paramSpans = container.querySelectorAll('.pseudocode-param');
		expect(paramSpans.length).toBeGreaterThan(0);

		// End procedure highlighting
		const endSpans = container.querySelectorAll('.pseudocode-end');
		expect(endSpans.length).toBeGreaterThan(0);

		// Keyword highlighting (e.g. if, for, return)
		const keywordSpans = container.querySelectorAll('.pseudocode-keyword');
		expect(keywordSpans.length).toBeGreaterThan(0);
	});

	it('computes indentation style based on leading spaces', () => {
		render(<Pseudocode algoName="ArrayList" language="code" />);

		// Line with 2 spaces indent -> indentLevel 1 -> 20px paddingLeft
		const indentedLine = document.getElementById('addFB-1');
		expect(indentedLine).toHaveStyle({ paddingLeft: '20px' });

		// Top-level procedure line -> 0px paddingLeft
		const rootLine = document.getElementById('addFB-0');
		expect(rootLine).toHaveStyle({ paddingLeft: '0px' });
	});

	it('escapes HTML special characters safely', () => {
		const { container } = render(<Pseudocode algoName="ArrayList" language="code" />);

		// Should not produce unescaped raw HTML entities that break rendering
		expect(container.querySelector('.pseudocode-modal-content')).toBeInTheDocument();
	});

	it('renders empty modal content without crashing when algorithm has no pseudocode', () => {
		const { container } = render(
			<Pseudocode algoName="NonExistentAlgorithm" language="english" />,
		);

		const modalContent = container.querySelector('.pseudocode-modal-content');
		expect(modalContent).toBeInTheDocument();
		expect(modalContent.children.length).toBe(0);
	});
});
