export interface DotenvParseOutput {
	[name: string]: string;
}

const rawMultiLine = (value: string, lineIndex: number, lines: string[], quote: string): string => {
	let endQuoteIndex = value.indexOf(quote);

	while (endQuoteIndex === -1) {
		lineIndex++;

		if (lineIndex >= lines.length) {
			throw new Error('.env: Multiline value missing closing quote' + value);
		}

		value += '\n' + lines[lineIndex];

		endQuoteIndex = value.indexOf(quote);
	}

	return value;
};

export const parse = (src: string | Buffer): DotenvParseOutput => {
	const obj: DotenvParseOutput = {};
	const lines = src.toString().split(/\r?\n/);

	for (const line of lines) {
		const lineIndex = lines.indexOf(line);

		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith('#')) continue;

		const index = trimmedLine.indexOf('=');
		if (index === -1) continue;

		const key = trimmedLine.slice(0, index).trim();
		let value = trimmedLine.slice(index + 1).trim();

		let wasQuoted = false;

		for (const quote of ['"', "'", '`']) {
			if (value[0] === quote) {
				value = value.slice(1);
				wasQuoted = true;

				let endQuoteIndex = value.indexOf(quote);

				if (endQuoteIndex === -1) {
					value = rawMultiLine(value, lineIndex, lines, quote);

					endQuoteIndex = value.indexOf(quote);

					if (endQuoteIndex === -1) {
						throw new Error('.env: Multiline value missing closing quote' + value);
					}
				}

				while (endQuoteIndex > 0 && value[endQuoteIndex - 1] === '\\') {
					endQuoteIndex = value.indexOf('"', endQuoteIndex + 1);
				}

				value = value.slice(0, endQuoteIndex);

				if (quote === '"') {
					value = value
						.replaceAll('\\n', '\n')
						.replaceAll('\\r', '\r')
						.replaceAll('\\t', '\t');
				}

				break;
			}
		}

		if (value.includes('#') && !wasQuoted) {
			const commentIndex = value.indexOf('#');

			if (commentIndex === 0 || value[commentIndex - 1] !== '\\') {
				value = value.slice(0, commentIndex).trim();
			}
		}

		obj[key] = value;
	}

	return obj;
};
