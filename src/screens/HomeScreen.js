import '../css/App.css';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { algoFilter, algoList, algoMap, relatedSearches } from '../AlgoList';
import AboutScreen from './AboutScreen';
import Blob from '../components/Blob';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React from 'react';
import SearchFilter from '../components/HomeScreen/SearchFilter';
import SideButton from '../components/HomeScreen/SideButton';

/* Side Panel Buttons */
const allCategories = [...new Set(algoFilter.map(item => item.category))];

/* Survey for Finals */
// eslint-disable-next-line no-unused-vars
function FinalsBanner() {
	return (
		<div className="banner-container">
			<div className="banner">
				<span role="img" aria-label="nerd">
					🤓
				</span>
				<span> Studying for the final? </span>
				<a href="https://forms.gle/j9iMhFi8drjf2PU86" target="_blank" rel="noreferrer">
					Tell us how we can improve!
				</a>
			</div>
		</div>
	);
}

const HomeScreen = ({ theme, toggleTheme }) => {
	/* Search Bar Functionality */
	const [searchParams, setSearchParams] = useSearchParams();

	/* Search Param Setter */
	const setQueryParam = (param, newFilter) => {
		if (newFilter && newFilter !== '') {
			searchParams.set(param, newFilter);
			setSearchParams(searchParams, { replace: true });
		} else {
			searchParams.delete(param);
			setSearchParams(searchParams, { replace: true });
		}
	};

	/* Search Param Getters */
	const algoFilterButton = searchParams.get('filter') ? searchParams.get('filter') : '';
	const dsaFilter = searchParams.get('q') ? searchParams.get('q') : '';

	const filterList =
		algoFilterButton === ''
			? algoList
			: algoFilter.filter(item => item.category === algoFilterButton).map(item => item.id);

	/* Creating the final list of algorithms */
	const filteredAlgoList = filterList.filter(name => {
		if (dsaFilter) {
			return (
				algoMap[name] &&
				(name.toLowerCase().includes(dsaFilter.toLowerCase()) ||
					algoMap[name][0].toLowerCase().includes(dsaFilter.toLowerCase()))
			);
		}
		return true;
	});

	function getRelatedAlgoList() {
		const relatedSet = new Set();
		if (dsaFilter) {
			for (const key in relatedSearches) {
				if (key.toLowerCase().includes(dsaFilter.toLowerCase())) {
					relatedSearches[key].forEach(value => {
						if (!filteredAlgoList.includes(value)) {
							relatedSet.add(value);
						}
					});
				}
			}
		}
		return Array.from(relatedSet);
	}

	return (
		<div className="container">
			<Header theme={theme} toggleTheme={toggleTheme} />
			<div className="content">
				<Routes>
					<Route
						path="*"
						element={
							<>
								{/* <FinalsBanner></FinalsBanner> */}
								<div className="outer-flex">
									{/* Side Navigator*/}
									<div className="side-panel">
										{/* Search Bar */}
										<input
											className="dsa-filter"
											placeholder="Search..."
											type="search"
											value={dsaFilter}
											onChange={e => setQueryParam('q', e.target.value)}
										/>
										<SideButton
											button={allCategories}
											filter={buttonValue =>
												setQueryParam('filter', buttonValue)
											}
										/>
									</div>
									{/* Blob Gimmick */}
									<div id="blob-container">
										<Blob />
									</div>
									<div className="mid-flex">
										<div className="inner-flex">
											<SearchFilter filteredAlgoList={filteredAlgoList} />
										</div>
										{getRelatedAlgoList().length > 0 && (
											<>
												<h1 className="related-pages-header">
													Related Pages
												</h1>
												<div className="inner-flex">
													<SearchFilter
														filteredAlgoList={getRelatedAlgoList()}
													/>
												</div>
											</>
										)}
									</div>
								</div>
							</>
						}
					/>
					<Route path="/about" element={<AboutScreen />} />
				</Routes>
			</div>
			<Footer />
		</div>
	);
};

export default HomeScreen;
