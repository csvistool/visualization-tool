import React, { useEffect, useMemo } from 'react';
import pseudocodeText from '../../pseudocode.json';

import { useState } from 'react';

const highlightSyntax = content => {
	content = content[0];

	const indentMatch = content.match(/^(\s+)/);
	const indentLevel = indentMatch ? indentMatch[0].length / 2 : 0;

	// Create a safe version of the content by escaping HTML
	const escapeHtml = unsafe => {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	};

	const escaped = escapeHtml(content);

	// Define regex patterns for different code elements
	const keywordPattern = /\b(if|else|for|while|return)\b/g;
	const procedureStartPattern = /\b(procedure)\s+(\w+)/g;
	const endProcedurePattern = /\b(end)\s+(procedure)\b/g;
	const paramPattern = /\(([^)]+)\)/g;

	// Apply highlighting with span elements
	let highlighted = escaped
		.replace(endProcedurePattern, '<span class="pseudocode-end">$1 $2</span>')
		.replace(procedureStartPattern, '<span class="pseudocode-procedure">$1 $2</span>')
		.replace(keywordPattern, '<span class="pseudocode-keyword">$1</span>');

	// Handle parameters separately to avoid nested replacements
	highlighted = highlighted.replace(paramPattern, function (_, p1) {
		return '(<span class="pseudocode-param">' + p1 + '</span>)';
	});

	return { indentLevel: indentLevel, __html: highlighted };
};

const Pseudocode = ({ algoName }) => {
	// we don't want to keep re-parsing the psuedocode every line animation, so cache it

	const [pseudocode, setPseudocode] = useState(null);

	useEffect(() => {
		const pseudocode = pseudocodeText[algoName];

		setPseudocode(pseudocode);
	}, [algoName]);

	const mappedPseudocode = useMemo(() => {
		const processPseudocode = () => {
			const mappedPseudocode = {};

			for (const methodName in pseudocode) {
				mappedPseudocode[methodName] = {
					code: pseudocode[methodName]['code'].map(highlightSyntax),
					english: pseudocode[methodName]['english'].map(highlightSyntax),
				};
			}

			return mappedPseudocode;
		};

		return processPseudocode();
	}, [pseudocode]);

	return (
		<div className="pseudocode-modal-content">
			{pseudocode &&
				Object.keys(mappedPseudocode).map(methodName => {
					return mappedPseudocode[methodName]['english'].map((line, i) => {
						return (
							<div
								key={methodName + i}
                id={`${methodName}-${i}`}
								className={`pseudocode-line`}
								style={{
									paddingLeft: `${line.indentLevel * 20}px`,
								}}
								dangerouslySetInnerHTML={{ __html: line.__html }}
							></div>
						);
					});
				})}
		</div>
	);
};

export default Pseudocode;
