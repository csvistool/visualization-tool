import { render, screen } from '@testing-library/react';
import AlgorithmNotFound404 from '../AlgorithmNotFound404';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

describe('AlgorithmNotFound404 Component', () => {
	it('renders 404 heading, explanatory message, and navigation link back to home', () => {
		render(
			<MemoryRouter>
				<AlgorithmNotFound404 />
			</MemoryRouter>,
		);

		// Assert 404 heading
		expect(screen.getByRole('heading', { level: 1, name: '404!' })).toBeInTheDocument();

		// Assert explanatory heading message
		expect(
			screen.getByRole('heading', {
				level: 3,
				name: /Algorithm not found! Click here to return to the home screen and choose another algorithm\./i,
			}),
		).toBeInTheDocument();

		// Assert return link points to home
		const homeLink = screen.getByRole('link', { name: 'here' });
		expect(homeLink).toBeInTheDocument();
		expect(homeLink).toHaveAttribute('href', '/');
	});

	it('renders Header and Footer layout elements', () => {
		render(
			<MemoryRouter>
				<AlgorithmNotFound404 />
			</MemoryRouter>,
		);

		// Header title
		expect(
			screen.getByText('CS 1332 Data Structures & Algorithms Visualization Tool'),
		).toBeInTheDocument();

		// Footer attribution
		expect(screen.getByText(/CS 1332 Teaching Team and Rodrigo Pontes/i)).toBeInTheDocument();
	});
});
