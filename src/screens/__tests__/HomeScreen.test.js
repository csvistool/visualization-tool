import { MemoryRouter, useLocation } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import HomeScreen from '../HomeScreen';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Helper component to observe search params and location pathname in MemoryRouter
const LocationDisplay = () => {
	const location = useLocation();
	return (
		<div data-testid="location-display">
			<span data-testid="location-pathname">{location.pathname}</span>
			<span data-testid="location-search">{location.search}</span>
		</div>
	);
};

describe('HomeScreen Component Integration Tests', () => {
	it('renders default page elements including Header, Footer, search input, category filters, and initial cards', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		// Header and Footer are visible to the user
		expect(
			screen.getByText('CS 1332 Data Structures & Algorithms Visualization Tool'),
		).toBeInTheDocument();
		expect(screen.getByText(/CS 1332 Teaching Team and Rodrigo Pontes/i)).toBeInTheDocument();

		// Search input is rendered and empty
		const searchInput = screen.getByPlaceholderText('Search...');
		expect(searchInput).toBeInTheDocument();
		expect(searchInput).toHaveValue('');

		// Sidebar contains "All" and multiple category filter options
		const sidePanel = container.querySelector('.side-panel');
		expect(within(sidePanel).getByRole('button', { name: 'All' })).toBeInTheDocument();
		const categoryButtons = within(sidePanel).getAllByRole('button');
		expect(categoryButtons.length).toBeGreaterThan(1);

		// Main grid displays algorithm cards
		const mainGrid = container.querySelector('.mid-flex .inner-flex');
		const algorithmCards = within(mainGrid).getAllByRole('link');
		expect(algorithmCards.length).toBeGreaterThan(0);

		// Blob mascot container is present
		expect(container.querySelector('#blob-container')).toBeInTheDocument();

		// Related pages and empty state should not be present initially
		expect(screen.queryByText('Related Pages')).not.toBeInTheDocument();
		expect(
			screen.queryByText('No results found. Please try a different search term.'),
		).not.toBeInTheDocument();
	});

	it('filters algorithm cards and synchronizes URL query param on text search', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
				<LocationDisplay />
			</MemoryRouter>,
		);

		const searchInput = screen.getByPlaceholderText('Search...');

		// Search for "Stack"
		fireEvent.change(searchInput, { target: { value: 'Stack' } });
		expect(searchInput).toHaveValue('Stack');

		// URL search query param updated
		expect(screen.getByTestId('location-search')).toHaveTextContent('?q=Stack');

		// Main results grid displays matching stack algorithms
		const mainGrid = container.querySelector('.mid-flex .inner-flex');
		expect(
			within(mainGrid).getByRole('link', { name: /Stack \(Array\)/i }),
		).toBeInTheDocument();
		expect(
			within(mainGrid).getByRole('link', { name: /Stack \(LinkedList\)/i }),
		).toBeInTheDocument();

		// Non-matching algorithm is filtered out
		expect(
			within(mainGrid).queryByRole('link', { name: /Quicksort/i }),
		).not.toBeInTheDocument();

		// Clear search
		fireEvent.change(searchInput, { target: { value: '' } });
		expect(searchInput).toHaveValue('');
		expect(screen.getByTestId('location-search')).toHaveTextContent('');

		// Non-matching algorithms restored
		expect(within(mainGrid).getByRole('link', { name: /Quicksort/i })).toBeInTheDocument();
	});

	it('filters algorithm cards by category and synchronizes URL filter param', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
				<LocationDisplay />
			</MemoryRouter>,
		);

		// Click "Linear Data Structures" category button
		const linearButton = screen.getByRole('button', { name: 'Linear Data Structures' });
		userEvent.click(linearButton);

		// URL search param updated to include filter
		expect(screen.getByTestId('location-search').textContent).toContain(
			'filter=Linear+Data+Structures',
		);

		// Linear data structures should be displayed in main grid
		const mainGrid = container.querySelector('.mid-flex .inner-flex');
		expect(
			within(mainGrid).getByRole('link', { name: /Stack \(Array\)/i }),
		).toBeInTheDocument();
		expect(
			within(mainGrid).getByRole('link', { name: /Queue \(Array\)/i }),
		).toBeInTheDocument();

		// Non-linear algorithms should be filtered out
		expect(
			within(mainGrid).queryByRole('link', { name: /Quicksort/i }),
		).not.toBeInTheDocument();
		expect(
			within(mainGrid).queryByRole('link', { name: /Binary Search Tree/i }),
		).not.toBeInTheDocument();

		// Click "All" button to reset category filter
		const allButton = screen.getByRole('button', { name: 'All' });
		userEvent.click(allButton);

		// URL filter param cleared
		expect(screen.getByTestId('location-search')).toHaveTextContent('');

		// Non-linear algorithms should be visible again
		expect(within(mainGrid).getByRole('link', { name: /Quicksort/i })).toBeInTheDocument();
		expect(
			within(mainGrid).getByRole('link', { name: /Binary Search Tree/i }),
		).toBeInTheDocument();
	});

	it('filters algorithm cards by combined search query and category', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
				<LocationDisplay />
			</MemoryRouter>,
		);

		// Select "Linear Data Structures" category
		userEvent.click(screen.getByRole('button', { name: 'Linear Data Structures' }));
		expect(screen.getByTestId('location-search').textContent).toContain(
			'filter=Linear+Data+Structures',
		);

		// Enter "Queue" in search input
		const searchInput = screen.getByPlaceholderText('Search...');
		fireEvent.change(searchInput, { target: { value: 'Queue' } });

		// URL contains both params
		const searchString = screen.getByTestId('location-search').textContent;
		expect(searchString).toContain('filter=Linear+Data+Structures');
		expect(searchString).toContain('q=Queue');

		// Primary results container only contains matching algorithms
		const mainGrid = container.querySelector('.mid-flex .inner-flex');
		expect(
			within(mainGrid).getByRole('link', { name: /Queue \(Array\)/i }),
		).toBeInTheDocument();
		expect(
			within(mainGrid).getByRole('link', { name: /Queue \(LinkedList\)/i }),
		).toBeInTheDocument();

		// Other linear data structures filtered out from main results
		expect(
			within(mainGrid).queryByRole('link', { name: /Stack \(Array\)/i }),
		).not.toBeInTheDocument();

		// Non-category algorithms completely excluded
		expect(
			within(mainGrid).queryByRole('link', { name: /Quicksort/i }),
		).not.toBeInTheDocument();
	});

	it('conditionally displays and removes Related Pages based on search term', () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByPlaceholderText('Search...');

		// Search for "BST", which has related algorithms configured
		fireEvent.change(searchInput, { target: { value: 'BST' } });

		// Related Pages header appears
		expect(
			screen.getByRole('heading', { level: 1, name: 'Related Pages' }),
		).toBeInTheDocument();

		// Related algorithms section is populated
		expect(screen.getByRole('link', { name: /AVL/i })).toBeInTheDocument();

		// Clear search term
		fireEvent.change(searchInput, { target: { value: '' } });

		// Related Pages section disappears
		expect(screen.queryByRole('heading', { name: 'Related Pages' })).not.toBeInTheDocument();
	});

	it('displays no results message when search matches no algorithms or related pages', () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByPlaceholderText('Search...');
		fireEvent.change(searchInput, { target: { value: 'NonExistentAlgorithm123' } });

		expect(
			screen.getByText('No results found. Please try a different search term.'),
		).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Related Pages' })).not.toBeInTheDocument();
	});

	it('pre-populates filters when mounted with existing URL query parameters', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/?q=Queue&filter=Linear+Data+Structures']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByPlaceholderText('Search...');
		expect(searchInput).toHaveValue('Queue');

		const mainGrid = container.querySelector('.mid-flex .inner-flex');
		expect(
			within(mainGrid).getByRole('link', { name: /Queue \(Array\)/i }),
		).toBeInTheDocument();
		expect(
			within(mainGrid).queryByRole('link', { name: /Stack \(Array\)/i }),
		).not.toBeInTheDocument();
		expect(
			within(mainGrid).queryByRole('link', { name: /Quicksort/i }),
		).not.toBeInTheDocument();
	});

	it('renders AboutScreen when navigated to /about sub-route', () => {
		render(
			<MemoryRouter initialEntries={['/about']}>
				<HomeScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		// AboutScreen heading is displayed
		expect(
			screen.getByRole('heading', { level: 1, name: 'About this Tool' }),
		).toBeInTheDocument();

		// Main HomeScreen elements (search input and side panel) are not rendered on /about
		expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
	});

	it('propagates theme and toggleTheme callbacks to Header component', () => {
		const mockToggleTheme = jest.fn();
		const { container } = render(
			<MemoryRouter initialEntries={['/']}>
				<HomeScreen theme="light" toggleTheme={mockToggleTheme} />
			</MemoryRouter>,
		);

		const themeButton = container.querySelector('#theme svg');
		expect(themeButton).toBeInTheDocument();
		userEvent.click(themeButton);

		expect(mockToggleTheme).toHaveBeenCalledTimes(1);
	});
});
