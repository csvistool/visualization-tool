import '../css/App.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React from 'react';

const AboutScreen = ({ theme, toggleTheme }) => (
	<div className="container">
		<Header theme={theme} toggleTheme={toggleTheme} />
		<div className="about">
			<h1>About this Tool</h1>
			<p>
				This tool is designed to help you visualize and understand the data structures and
				algorithms covered in Georgia Tech's CS 1332 course. It is based on the{' '}
				<a href="https://www.cs.usfca.edu/~galles/visualization/about.html">
					Data Structures Visualizations website
				</a>{' '}
				created by David Galles.
			</p>
			<p>
				The CS 1332 Visualization Tool was adapted and expanded by{' '}
				<a href="https://rodrigodlpontes.github.io/website/">Rodrigo Pontes</a> under the
				supervision of Dr. Mary Hudachek-Buswell to include data structures and algorithms
				covered in the course. It has since been updated and revised by{' '}
				<a href="https://github.com/csvistool/visualization-tool#contributors-">
					many other wonderful contributors
				</a>
				.
			</p>
			<p>
				This site uses icons from{' '}
				<a href="https://material.io/resources/icons/?style=baseline">
					Google&#39;s Material Icons
				</a>{' '}
				and <a href="https://react-icons.github.io/react-icons">react-icons</a>, as well as
				components from <a href="https://material-ui.com/">Material UI</a>.
			</p>
		</div>
		<Footer />
	</div>
);

export default AboutScreen;
