import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import SearchFilter from '../SearchFilter';

describe('SearchFilter Component', () => {
	it('displays empty state message when filteredAlgoList is empty', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={[]} />
			</MemoryRouter>,
		);

		expect(
			screen.getByText('No results found. Please try a different search term.'),
		).toBeInTheDocument();
	});

	it('renders dividers as horizontal rules without rendering buttons or links', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={['---']} />
			</MemoryRouter>,
		);

		expect(screen.getByRole('separator')).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('renders algorithm cards with accessible links and images', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={['ArrayList', 'BST']} />
			</MemoryRouter>,
		);

		// Assert links point to the respective algorithm routes
		const arrayListLink = screen.getByRole('link', { name: /arraylist/i });
		expect(arrayListLink).toHaveAttribute('href', '/ArrayList');

		const bstLink = screen.getByRole('link', { name: /binary search tree/i });
		expect(bstLink).toHaveAttribute('href', '/BST');

		// Assert algorithm preview images have appropriate alt texts
		expect(screen.getByAltText('ArrayList')).toBeInTheDocument();
		expect(screen.getByAltText('Binary Search Tree')).toBeInTheDocument();
	});

	it('applies rainbow styling to algorithms that have the rainbow flag enabled in algoMap', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={['NonLinearProbing', 'ArrayList']} />
			</MemoryRouter>,
		);

		const rainbowButton = screen
			.getByRole('link', { name: /non-linear probing/i })
			.querySelector('button');
		const standardButton = screen
			.getByRole('link', { name: /arraylist/i })
			.querySelector('button');

		expect(rainbowButton).toHaveStyle({ color: 'white', filter: 'none' });
		expect(standardButton).not.toHaveStyle({ color: 'white' });
	});

	it('handles image loading fallback: falls back to .gif on .png error, and hides on .gif error', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={['ArrayList']} />
			</MemoryRouter>,
		);

		const img = screen.getByAltText('ArrayList');
		expect(img.getAttribute('src')).toBe('./algo_buttons/ArrayList.png');

		// First image error: simulate .png failure -> fallback to .gif
		fireEvent.error(img);
		expect(img.getAttribute('src')).toBe('./algo_buttons/ArrayList.gif');

		// Second image error: simulate .gif failure -> hide image element
		fireEvent.error(img);
		expect(img.style.display).toBe('none');
	});

	it('gracefully ignores unknown algorithm keys that do not exist in algoMap', () => {
		render(
			<MemoryRouter>
				<SearchFilter filteredAlgoList={['NonExistentAlgorithmKey']} />
			</MemoryRouter>,
		);

		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});
