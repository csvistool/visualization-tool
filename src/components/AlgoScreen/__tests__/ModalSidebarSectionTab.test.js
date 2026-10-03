import { render, screen } from '@testing-library/react';
import ModalSidebarSectionTab from '../ModalSidebarSectionTab';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('ModalSidebarSectionTab Component', () => {
	const MockIcon = ({ size }) => <svg data-testid="mock-icon" width={size} height={size} />;

	it('renders tab button with title and icon', () => {
		render(
			<ModalSidebarSectionTab
				onClick={jest.fn()}
				icon={MockIcon}
				title="Pseudocode"
				name="code"
				currentTab="about"
			/>,
		);

		const tabButton = screen.getByRole('button', { name: /Pseudocode/i });
		expect(tabButton).toBeInTheDocument();
		expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
		expect(screen.getByText('Pseudocode')).toBeInTheDocument();
	});

	it('applies active class when name matches currentTab', () => {
		render(
			<ModalSidebarSectionTab
				onClick={jest.fn()}
				icon={MockIcon}
				title="About"
				name="about"
				currentTab="about"
			/>,
		);

		const tabButton = screen.getByRole('button', { name: /About/i });
		expect(tabButton).toHaveClass('tab-button');
		expect(tabButton).toHaveClass('active');
	});

	it('does not apply active class when name does not match currentTab', () => {
		render(
			<ModalSidebarSectionTab
				onClick={jest.fn()}
				icon={MockIcon}
				title="Big O"
				name="bigo"
				currentTab="about"
			/>,
		);

		const tabButton = screen.getByRole('button', { name: /Big O/i });
		expect(tabButton).toHaveClass('tab-button');
		expect(tabButton).not.toHaveClass('active');
	});

	it('triggers onClick handler when clicked', () => {
		const mockOnClick = jest.fn();
		render(
			<ModalSidebarSectionTab
				onClick={mockOnClick}
				icon={MockIcon}
				title="About"
				name="about"
				currentTab="code"
			/>,
		);

		const tabButton = screen.getByRole('button', { name: /About/i });
		userEvent.click(tabButton);

		expect(mockOnClick).toHaveBeenCalledTimes(1);
	});

	it('renders safely when no icon is provided', () => {
		render(
			<ModalSidebarSectionTab
				onClick={jest.fn()}
				title="No Icon Tab"
				name="noicon"
				currentTab="noicon"
			/>,
		);

		expect(screen.getByRole('button', { name: /No Icon Tab/i })).toBeInTheDocument();
		expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
	});
});
