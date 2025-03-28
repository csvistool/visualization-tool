import { Link } from "react-router-dom";
import React from "react";
import { algoMap } from "../../AlgoList";

const SearchFilter = React.memo(function SearchFilter({ filteredAlgoList }) {
	return filteredAlgoList.length ? (
		filteredAlgoList.map(
			(name, idx) =>
				algoMap[name] && (
					<Link to={`/${name}`} key={idx} style={{ textDecoration: 'none' }}>
						<button
							className="button"
							style={algoMap[name][4]
									? {
											background:
												'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%)',
											color: 'white',
											filter: 'none',
									  }
									: {}
							}
						>
							<div className="algo-container">
								<div className="algo-name">{algoMap[name][0]}</div>
								{algoMap[name][0] && (
									<div className="algo-picture">
										<img
											alt={algoMap[name][0]}
											src={`./algo_buttons/${algoMap[name][0]}.png`}
											onError={e => {
												const currentSrc = e.target.src;
												if (currentSrc.endsWith('.png')) {
													e.target.src = `./algo_buttons/${algoMap[name][0]}.gif`;
												} else if (currentSrc.endsWith('.gif')) {
													e.target.style.display = 'none';
												}
											}}
										/>
									</div>
								)}
							</div>
						</button>
					</Link>
				),
		)
	) : (
		<span className="no-results">No results found. Please try a different search term.</span>
	);
})

export default SearchFilter;