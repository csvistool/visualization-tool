import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import React from 'react';

describe('Footer Component', () => {
	it('renders dynamic copyright year notice', () => {
		render(<Footer />);

		const currentYear = new Date().getFullYear().toString();
		expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
		expect(screen.getByText(/CS 1332 Teaching Team and Rodrigo Pontes/i)).toBeInTheDocument();
	});

	it('renders attribution link to David Galles with correct href', () => {
		render(<Footer />);

		const gallesLink = screen.getByRole('link', { name: 'David Galles' });
		expect(gallesLink).toBeInTheDocument();
		expect(gallesLink).toHaveAttribute('href', 'http://www.cs.usfca.edu/galles');
	});
});
