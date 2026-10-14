import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Simple Unit Test to validate component mount', () => {
	it('mounts a component and validates jest-dom matchers', () => {
		render(<div>CS 1332 Visualization Tool</div>);
		const element = screen.getByText('CS 1332 Visualization Tool');
		expect(element).toBeInTheDocument();
	});
});
