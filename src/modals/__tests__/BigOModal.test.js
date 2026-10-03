import { fireEvent, render, screen } from '@testing-library/react';
import BigOModal from '../BigOModal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('BigOModal Component', () => {
	const sampleComplexities = {
		'Add to End': {
			best: {
				big_o: 'O(1)',
				explanation: 'Directly append when $capacity > size$',
			},
			worst: {
				big_o: 'O(n)',
				explanation: 'Resize and copy array',
			},
		},
		'Access by Index': {
			average: {
				big_o: 'O(1)',
				explanation: 'Random access memory',
			},
		},
	};

	it('returns null when complexities prop is null or undefined', () => {
		const { container: containerNull } = render(<BigOModal complexities={null} />);
		expect(containerNull).toBeEmptyDOMElement();

		const { container: containerUndefined } = render(<BigOModal />);
		expect(containerUndefined).toBeEmptyDOMElement();
	});

	it('renders table with operation headers, cases, formulas, and explanations', () => {
		render(<BigOModal complexities={sampleComplexities} />);

		expect(screen.getByRole('button', { name: 'Reveal All Big-O' })).toBeInTheDocument();
		expect(screen.getByText('Click to reveal answer')).toBeInTheDocument();

		expect(screen.getByRole('heading', { level: 4, name: 'Add to End' })).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { level: 4, name: 'Access by Index' }),
		).toBeInTheDocument();

		expect(screen.getByText('Best')).toBeInTheDocument();
		expect(screen.getByText('Worst')).toBeInTheDocument();
		expect(screen.getByText('Average')).toBeInTheDocument();

		expect(screen.getAllByText('O(1)', { selector: '.equation' }).length).toBe(2);
		expect(screen.getByText('O(n)', { selector: '.equation' })).toBeInTheDocument();
		expect(screen.getByText('Resize and copy array')).toBeInTheDocument();
	});

	it('toggles blur class on individual cell click', () => {
		render(<BigOModal complexities={sampleComplexities} />);

		const explanationCell = screen.getByText('Resize and copy array').closest('td');
		expect(explanationCell).toHaveClass('blur');
		expect(explanationCell).toHaveClass('big_o_cell');

		// Click to unblur
		fireEvent.click(explanationCell);
		expect(explanationCell).not.toHaveClass('blur');

		// Click again to re-blur
		fireEvent.click(explanationCell);
		expect(explanationCell).toHaveClass('blur');
	});

	it('toggles all cells between revealed and blurred via the global toggle button', () => {
		const { container } = render(<BigOModal complexities={sampleComplexities} />);

		const toggleButton = screen.getByRole('button', { name: 'Reveal All Big-O' });
		const cells = container.querySelectorAll('.big_o_cell');
		expect(cells.length).toBeGreaterThan(0);

		// Initially all cells are blurred
		cells.forEach(cell => {
			expect(cell).toHaveClass('blur');
		});

		// Click "Reveal All Big-O"
		userEvent.click(toggleButton);
		expect(toggleButton).toHaveTextContent('Hide All Big-O');
		cells.forEach(cell => {
			expect(cell).not.toHaveClass('blur');
		});

		// Click "Hide All Big-O"
		userEvent.click(toggleButton);
		expect(toggleButton).toHaveTextContent('Reveal All Big-O');
		cells.forEach(cell => {
			expect(cell).toHaveClass('blur');
		});
	});

	it('formats equations using $ delimiters and forced equation cells', () => {
		const { container } = render(<BigOModal complexities={sampleComplexities} />);

		// Substring enclosed in $capacity > size$ should have equation class
		const delimitedEquation = container.querySelector('.equation');
		expect(delimitedEquation).toBeInTheDocument();

		// Check that the delimited equation content is correctly styled
		const equations = screen.getAllByText(/capacity > size/i);
		expect(equations.length).toBeGreaterThan(0);
		expect(equations[0]).toHaveClass('equation');
	});
});
