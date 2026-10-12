import { render, screen } from '@testing-library/react';
import React from 'react';
import SideButton from '../SideButton';
import userEvent from '@testing-library/user-event';

describe('SideButton Component', () => {
	it('renders accessible buttons for "All" and each category in the list', () => {
		const categories = ['Lists', 'Trees', 'Sorting', 'Graph Algorithms'];
		const mockFilter = jest.fn();

		render(<SideButton button={categories} filter={mockFilter} />);

		// Verify user can find the default 'All' reset button by accessible role
		expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();

		// Verify user can find every category button by accessible name
		categories.forEach(category => {
			expect(screen.getByRole('button', { name: category })).toBeInTheDocument();
		});

		// Verify exactly the expected number of buttons are exposed to assistive tech
		expect(screen.getAllByRole('button')).toHaveLength(categories.length + 1);
	});

	it('notifies the filter callback when user selects "All"', () => {
		const mockFilter = jest.fn();
		render(<SideButton button={['Lists', 'Trees']} filter={mockFilter} />);

		const allButton = screen.getByRole('button', { name: /^all$/i });
		userEvent.click(allButton);

		expect(mockFilter).toHaveBeenCalledTimes(1);
		expect(mockFilter).toHaveBeenCalledWith('');
	});

	it('notifies the filter callback with the chosen category when user clicks it', () => {
		const categories = ['Lists', 'Trees', 'Sorting'];
		const mockFilter = jest.fn();
		render(<SideButton button={categories} filter={mockFilter} />);

		const treesButton = screen.getByRole('button', { name: 'Trees' });
		userEvent.click(treesButton);

		expect(mockFilter).toHaveBeenCalledTimes(1);
		expect(mockFilter).toHaveBeenCalledWith('Trees');
	});

	it('supports consecutive category selections and returning to "All"', () => {
		const categories = ['Lists', 'Trees', 'Sorting'];
		const mockFilter = jest.fn();
		render(<SideButton button={categories} filter={mockFilter} />);

		// User clicks 'Lists'
		userEvent.click(screen.getByRole('button', { name: 'Lists' }));
		expect(mockFilter).toHaveBeenLastCalledWith('Lists');

		// User switches to 'Sorting'
		userEvent.click(screen.getByRole('button', { name: 'Sorting' }));
		expect(mockFilter).toHaveBeenLastCalledWith('Sorting');

		// User resets to 'All'
		userEvent.click(screen.getByRole('button', { name: /^all$/i }));
		expect(mockFilter).toHaveBeenLastCalledWith('');

		expect(mockFilter).toHaveBeenCalledTimes(3);
	});

	it('renders gracefully when provided an empty category array', () => {
		const mockFilter = jest.fn();
		render(<SideButton button={[]} filter={mockFilter} />);

		// Only 'All' should be present
		expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
		expect(screen.getAllByRole('button')).toHaveLength(1);
	});
});
