import { render, screen } from '@testing-library/react';
import AboutScreen from '../AboutScreen';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('AboutScreen Component', () => {
	it('renders heading, layout container, Header, and Footer', () => {
		render(
			<MemoryRouter>
				<AboutScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		// Assert main page heading is rendered
		expect(
			screen.getByRole('heading', { level: 1, name: 'About this Tool' }),
		).toBeInTheDocument();

		// Assert Header title and Footer attribution are present
		expect(
			screen.getByText('CS 1332 Data Structures & Algorithms Visualization Tool'),
		).toBeInTheDocument();
		expect(screen.getByText(/CS 1332 Teaching Team and Rodrigo Pontes/i)).toBeInTheDocument();
	});

	it('renders all external attribution and resource links', () => {
		render(
			<MemoryRouter>
				<AboutScreen theme="light" toggleTheme={jest.fn()} />
			</MemoryRouter>,
		);

		const gallesLink = screen.getByRole('link', {
			name: 'Data Structures Visualizations website',
		});
		expect(gallesLink).toHaveAttribute(
			'href',
			'https://www.cs.usfca.edu/~galles/visualization/about.html',
		);

		const rodrigoLink = screen.getByRole('link', { name: 'Rodrigo Pontes' });
		expect(rodrigoLink).toHaveAttribute('href', 'https://rodrigodlpontes.github.io/website/');

		const contributorsLink = screen.getByRole('link', {
			name: 'many other wonderful contributors',
		});
		expect(contributorsLink).toHaveAttribute(
			'href',
			'https://github.com/csvistool/visualization-tool#contributors-',
		);

		const materialIconsLink = screen.getByRole('link', {
			name: /Google's Material Icons/i,
		});
		expect(materialIconsLink).toHaveAttribute(
			'href',
			'https://material.io/resources/icons/?style=baseline',
		);

		const reactIconsLink = screen.getByRole('link', { name: 'react-icons' });
		expect(reactIconsLink).toHaveAttribute('href', 'https://react-icons.github.io/react-icons');

		const muiLink = screen.getByRole('link', { name: 'Material UI' });
		expect(muiLink).toHaveAttribute('href', 'https://material-ui.com/');
	});

	it('propagates theme and toggleTheme callbacks to Header', () => {
		const mockToggleTheme = jest.fn();
		const { container } = render(
			<MemoryRouter>
				<AboutScreen theme="light" toggleTheme={mockToggleTheme} />
			</MemoryRouter>,
		);

		const themeButton = container.querySelector('#theme svg');
		expect(themeButton).toBeInTheDocument();
		userEvent.click(themeButton);

		expect(mockToggleTheme).toHaveBeenCalledTimes(1);
	});
});
