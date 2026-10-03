import { render, screen } from '@testing-library/react';
import App from '../App';
import Cookies from 'js-cookie';
import React from 'react';
import ReactGA from 'react-ga4';
import userEvent from '@testing-library/user-event';

describe('App Root Component', () => {
	beforeEach(() => {
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
		Element.prototype.scrollIntoView = jest.fn();
		jest.spyOn(ReactGA, 'initialize').mockImplementation(() => {});
		jest.spyOn(ReactGA, 'send').mockImplementation(() => {});
		document.body.removeAttribute('data-theme');
	});

	afterEach(() => {
		jest.restoreAllMocks();
		document.body.removeAttribute('data-theme');
		window.history.pushState({}, '', '/');
	});

	it('initializes Google Analytics and tracks home pageview', () => {
		render(<App />);

		expect(ReactGA.initialize).toHaveBeenCalledWith('G-0ERQ9E89XM');
		expect(ReactGA.send).toHaveBeenCalledWith({ hitType: 'pageview', page: 'home' });
	});

	it('renders HomeScreen by default with light theme when no cookie is set', () => {
		jest.spyOn(Cookies, 'get').mockReturnValue(undefined);

		render(<App />);

		expect(
			screen.getByText('CS 1332 Data Structures & Algorithms Visualization Tool'),
		).toBeInTheDocument();
		expect(document.body).not.toHaveAttribute('data-theme');
	});

	it('loads dark theme from cookie and applies data-theme attribute to body', () => {
		jest.spyOn(Cookies, 'get').mockReturnValue('dark');

		render(<App />);

		expect(document.body).toHaveAttribute('data-theme', 'dark');
	});

	it('toggles theme between light and dark, updating Cookies and body attribute', () => {
		jest.spyOn(Cookies, 'get').mockReturnValue(undefined);
		const cookieSetSpy = jest.spyOn(Cookies, 'set').mockImplementation(() => {});

		const { container } = render(<App />);

		const themeToggle = container.querySelector('#theme svg');
		expect(themeToggle).toBeInTheDocument();

		// Click to switch to dark theme
		userEvent.click(themeToggle);
		expect(cookieSetSpy).toHaveBeenCalledWith('theme', 'dark');
		expect(document.body).toHaveAttribute('data-theme', 'dark');

		// Re-query theme toggle (now rendering Moon icon) to switch back to light theme
		const darkToggle = container.querySelector('#theme svg');
		userEvent.click(darkToggle);
		expect(cookieSetSpy).toHaveBeenCalledWith('theme', 'light');
		expect(document.body).toHaveAttribute('data-theme', 'light');
	});

	it('renders AboutScreen when navigating to /about', () => {
		window.history.pushState({}, '', '/about');

		render(<App />);

		expect(
			screen.getByRole('heading', { level: 1, name: /About this Tool/i }),
		).toBeInTheDocument();
	});

	it('renders AlgoScreen when navigating to an algorithm route like /ArrayList', () => {
		window.history.pushState({}, '', '/ArrayList');

		render(<App />);

		expect(screen.getByRole('heading', { level: 1, name: /ArrayList/i })).toBeInTheDocument();
	});

	it('renders HomeScreen when navigating to an unmatched fallback route', () => {
		window.history.pushState({}, '', '/');

		render(<App />);

		expect(
			screen.getByText('CS 1332 Data Structures & Algorithms Visualization Tool'),
		).toBeInTheDocument();
	});
});
