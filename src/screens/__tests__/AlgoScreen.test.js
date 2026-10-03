import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AlgoScreen from '../AlgoScreen';
import React from 'react';
import { algoMap } from '../../AlgoList';
import userEvent from '@testing-library/user-event';

describe('AlgoScreen Component', () => {
	beforeEach(() => {
		// Mock HTMLCanvasElement getContext with Proxy for all 2D canvas drawing primitives
		HTMLCanvasElement.prototype.getContext = jest.fn(
			() =>
				new Proxy(
					{
						measureText: () => ({ width: 10 }),
					},
					{
						get: (target, prop) => {
							if (prop in target) return target[prop];
							return jest.fn();
						},
					},
				),
		);
	});

	it('renders AlgorithmNotFound404 when an unknown algorithm route is requested', () => {
		render(
			<MemoryRouter initialEntries={['/NonExistentAlgorithmXYZ']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByRole('heading', { level: 1, name: '404!' })).toBeInTheDocument();
		expect(
			screen.getByRole('heading', {
				level: 3,
				name: /Algorithm not found! Click here to return to the home screen/i,
			}),
		).toBeInTheDocument();
	});

	it('renders valid algorithm page with header, back button, and footer return link', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		// Header title
		expect(screen.getByRole('heading', { level: 1, name: /ArrayList/i })).toBeInTheDocument();

		// Back to home button in header
		const backLink = screen.getByRole('link', { name: '〈' });
		expect(backLink).toBeInTheDocument();
		expect(backLink).toHaveAttribute('href', '/');

		// Footer link to home
		const footerLink = screen.getByRole('link', { name: 'Return to Home Page' });
		expect(footerLink).toBeInTheDocument();
		expect(footerLink).toHaveAttribute('href', '/');
	});

	it('renders Quickselect heading on its route', () => {
		render(
			<MemoryRouter initialEntries={['/Quickselect']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		// Header includes Quickselect
		expect(screen.getByRole('heading', { level: 1, name: /Quickselect/i })).toBeInTheDocument();
	});

	it('renders Quickselect superscript formatting when menuDisplayName matches slash format', () => {
		const originalEntry = algoMap.Quickselect;
		algoMap.Quickselect = ['Quickselect / kᵗʰ Select', originalEntry[1], true];

		render(
			<MemoryRouter initialEntries={['/Quickselect']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByText('th')).toBeInTheDocument();

		algoMap.Quickselect = originalEntry;
	});

	it('toggles theme when clicking theme toggle icon in header', () => {
		const mockToggleTheme = jest.fn();
		const { container } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={mockToggleTheme} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		const themeToggle = container.querySelector('#toggle svg');
		expect(themeToggle).toBeInTheDocument();
		userEvent.click(themeToggle);

		expect(mockToggleTheme).toHaveBeenCalledTimes(1);
	});

	it('renders moon theme icon when dark theme is enabled', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="dark" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		const themeToggle = container.querySelector('#toggle svg');
		expect(themeToggle).toBeInTheDocument();
	});

	it('renders algorithm viewport and controls section', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route
						path="/:algo"
						element={<AlgoScreen theme="light" toggleTheme={jest.fn()} />}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(container.querySelector('#AlgorithmSpecificControls')).toBeInTheDocument();
		expect(container.querySelector('#canvas')).toBeInTheDocument();
		expect(container.querySelector('#GeneralAnimationControls')).toBeInTheDocument();
	});
});
