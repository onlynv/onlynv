const make = (color: string) => (str: string) => `\u001b[${color}m${str}\u001b[0m`;

export default {
	red: make('31'),
	green: make('32'),
	yellow: make('33'),
	blue: make('34'),
	magenta: make('35'),
	cyan: make('36'),
	white: make('37'),
	black: make('30'),
	gray: make('90'),
	bgRed: make('41'),
	bgGreen: make('42'),
	bgYellow: make('43'),
	bgBlue: make('44'),
	bgMagenta: make('45'),
	bgCyan: make('46'),
	bgWhite: make('47'),
	bgBlack: make('40'),
	bgGray: make('100'),
	bold: make('1'),
	italic: make('3'),
	underline: make('4'),
	strikethrough: make('9'),
	inverse: make('7'),
	hidden: make('8')
};
