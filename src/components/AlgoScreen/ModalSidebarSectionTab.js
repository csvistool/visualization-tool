import React from 'react';

const ModalSidebarSectionTab = ({ onClick, icon, title, name, currentTab }) => {
	const TabIcon = icon;

	return (
		<button className={`tab-button ${name === currentTab ? 'active' : ''}`} onClick={onClick}>
			{icon && <TabIcon size={18} />}
			<span className="tab-text">{title}</span>
		</button>
	);
};

export default ModalSidebarSectionTab;
