import React from 'react';

/* Reach.memo tells react to only rerender if the params change (which they wont) */
const SideButton = React.memo(function SideButton({ button, filter }) {
	return (
		<div className="Side-Buttons">
			<button type="button" onClick={() => filter('')} className="btn">
				All
			</button>
			{button.map((cat, i) => {
				return (
					<button type="button" key={i} onClick={() => filter(cat)} className="btn">
						{cat}
					</button>
				);
			})}
		</div>
	);
});

export default SideButton;
