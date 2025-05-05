import React, { useState } from 'react';
import timeComplexities from '../time_complexities.json';

let blurEnabled = true;

const applyEquationClass = (text, force) => {
	const regex = /\$(.*?)\$/g;
	return text.split(regex).map((part, index) =>
		index % 2 === 1 || force ? (
			<span key={index} className="equation">
				{part}
			</span>
		) : (
			part
		),
	);
};

const renderRows = data => {
	if (!data) {
		return null;
	}
	return Object.keys(data).map(operation => {
		const operationData = data[operation];
		return (
			<ul key={operation}>
				<h4>{operation}</h4>
				<table>
					<tbody>
						{Object.keys(operationData).map(complexity => (
							<tr key={complexity}>
								<td style={{ width: '15%' }}>
									{complexity[0].toUpperCase() + complexity.slice(1)}
								</td>
								<ToggleBlurCell
									text={operationData[complexity].big_o}
									width={'25%'}
									force={true}
								/>
								<ToggleBlurCell
									text={operationData[complexity].explanation}
									width={'60%'}
									force={false}
								/>
							</tr>
						))}
					</tbody>
				</table>
			</ul>
		);
	});
};

const ToggleBlurCell = ({ text, width, force }) => {
	const [isBlurred, setIsBlurred] = useState(true);

	return (
		<td
			style={{ width: width }}
			className={isBlurred ? 'blur big_o_cell' : 'big_o_cell'}
			onMouseEnter={() => setIsBlurred(false)}
			onMouseLeave={() => setIsBlurred(blurEnabled)}
		>
			{applyEquationClass(text, force)}
		</td>
	);
};

// Function to unblur all cells with the blur class
function toggleBlur() {
	blurEnabled = !blurEnabled;
	const cellElements = document.querySelectorAll('.big_o_cell');
	if (!blurEnabled) {
		cellElements.forEach(element => {
			element.classList.remove('blur');
		});
		const button = document.querySelector('.button-container button');
		button.textContent = 'Hide All Big-O';
	} else {
		cellElements.forEach(element => {
			element.classList.add('blur');
		});
		const button = document.querySelector('.button-container button');
		button.textContent = 'Reveal All Big-O';
	}
}

const Modals = page => {
	return timeComplexities[page] ? (
		<div>
			<div className="button-container">
				<button onClick={toggleBlur}>Reveal All Big-O</button>
			</div>
			{renderRows(timeComplexities[page])}
		</div>
	) : null;
};

export default Modals;
