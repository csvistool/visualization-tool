import { fireEvent, render, screen } from '@testing-library/react';
import Blob from '../Blob';
import React from 'react';

describe('Blob Component', () => {
	it('renders default mascot image and SVG without text bubble or audio', () => {
		const { container } = render(<Blob />);

		const img = container.querySelector('#blobLogo');
		expect(img).toBeInTheDocument();
		expect(img.getAttribute('src')).toBe('./favicon.png');

		expect(container.querySelector('#blobSvg')).toBeInTheDocument();
		expect(container.querySelector('#text-bubble')).not.toBeInTheDocument();
		expect(container.querySelector('audio')).not.toBeInTheDocument();
	});

	it('toggles text bubble and displays initial tip on first mouse down', () => {
		const { container } = render(<Blob />);

		// Trigger mouse down on the blob container
		fireEvent.mouseDown(container.firstChild);

		expect(screen.getByText("Welcome to CS 1332's visualization tool!")).toBeInTheDocument();
		expect(container.querySelector('#text-bubble')).toBeInTheDocument();
	});

	it('cycles through tips on sequential clicks', () => {
		const { container } = render(<Blob />);

		// Click 1: Open bubble with tip 0
		fireEvent.mouseDown(container.firstChild);
		expect(screen.getByText("Welcome to CS 1332's visualization tool!")).toBeInTheDocument();

		// Click 2: Close bubble and advance tip index
		fireEvent.mouseDown(container.firstChild);
		expect(container.querySelector('#text-bubble')).not.toBeInTheDocument();

		// Click 3: Re-open bubble with tip 1
		fireEvent.mouseDown(container.firstChild);
		expect(
			screen.getByText(
				'Click a data structure or algorithm to go to its visualization page!',
			),
		).toBeInTheDocument();
	});

	it('activates the Easter egg transformation and plays audio on final tip click', () => {
		const { container } = render(<Blob />);
		const img = container.querySelector('#blobLogo');

		// Click through all 8 tips (2 clicks per tip: open + close)
		for (let i = 0; i < 8; i++) {
			fireEvent.mouseDown(container.firstChild); // Open
			fireEvent.mouseDown(container.firstChild); // Close
		}

		// Now tipIndex is 8 (the empty string tip), trigger mouseDown to activate Easter egg
		fireEvent.mouseDown(container.firstChild);

		// Mascot image changes from favicon to jack
		expect(img.src).toContain('jack');
		expect(img).toHaveClass('blobLogo-animate');

		// Audio element renders
		const audioElement = container.querySelector('audio');
		expect(audioElement).toBeInTheDocument();

		// Simulating audio ended resets sound playback state
		fireEvent.ended(audioElement);
		expect(container.querySelector('audio')).not.toBeInTheDocument();
	});
});
