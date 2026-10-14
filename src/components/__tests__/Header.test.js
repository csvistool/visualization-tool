import { fireEvent, render, screen } from '@testing-library/react';
import Header from '../Header';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Header Component', () => {
	it('renders the header title correctly', () => {
		render(
			<MemoryRouter>
				<Header theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		expect(
			screen.getByRole('heading', {
				name: 'CS 1332 Data Structures & Algorithms Visualization Tool',
			}),
		).toBeInTheDocument();
	});

	it('invokes toggleTheme callback when theme icon is clicked', () => {
		const mockToggleTheme = jest.fn();
		const { container, rerender } = render(
			<MemoryRouter>
				<Header theme="light" toggleTheme={mockToggleTheme} />
			</MemoryRouter>,
		);

		// Click sun theme icon in light mode
		const themeIcon = container.querySelector('#theme svg');
		expect(themeIcon).toBeInTheDocument();
		userEvent.click(themeIcon);
		expect(mockToggleTheme).toHaveBeenCalledTimes(1);

		// Re-render in dark mode
		rerender(
			<MemoryRouter>
				<Header theme="dark" toggleTheme={mockToggleTheme} />
			</MemoryRouter>,
		);

		const darkThemeIcon = container.querySelector('#theme svg');
		expect(darkThemeIcon).toBeInTheDocument();
		userEvent.click(darkThemeIcon);
		expect(mockToggleTheme).toHaveBeenCalledTimes(2);
	});

	it('toggles navigation menu visibility when hamburger icon is clicked', () => {
		const { container } = render(
			<MemoryRouter>
				<Header theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const hamburgerIcon = container.querySelector('#menu svg');
		const menuElement = container.querySelector('.menu');

		// Initially, menu does not have 'show' class
		expect(menuElement).not.toHaveClass('show');

		// First click: open menu
		fireEvent.click(hamburgerIcon);
		expect(menuElement).toHaveClass('show');

		// Second click: close menu
		fireEvent.click(hamburgerIcon);
		expect(menuElement).toHaveClass('hide');
	});

	it('renders accessible navigation links with expected destinations', () => {
		render(
			<MemoryRouter>
				<Header theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink).toHaveAttribute('href', '/');

		const aboutLink = screen.getByRole('link', { name: /about/i });
		expect(aboutLink).toHaveAttribute('href', '/about');

		const sourceCodeLink = screen.getByRole('link', { name: /source code/i });
		expect(sourceCodeLink).toHaveAttribute(
			'href',
			'https://github.com/csvistool/visualization-tool',
		);
		expect(sourceCodeLink).toHaveAttribute('target', '_blank');
		expect(sourceCodeLink).toHaveAttribute('rel', 'noreferrer');

		const feedbackLink = screen.getByRole('link', { name: /feedback/i });
		expect(feedbackLink).toHaveAttribute('href', 'https://forms.gle/j9iMhFi8drjf2PU86');
		expect(feedbackLink).toHaveAttribute('target', '_blank');
		expect(feedbackLink).toHaveAttribute('rel', 'noreferrer');
	});

	it('closes the hamburger menu when a navigation link inside it is clicked', () => {
		const { container } = render(
			<MemoryRouter>
				<Header theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const hamburgerIcon = container.querySelector('#menu svg');
		const menuElement = container.querySelector('.menu');

		// Open menu
		fireEvent.click(hamburgerIcon);
		expect(menuElement).toHaveClass('show');

		// Click home link inside the menu
		const homeLink = screen.getByRole('link', { name: /home/i });
		fireEvent.click(homeLink);

		// Menu should now toggle closed
		expect(menuElement).toHaveClass('hide');
	});
});
