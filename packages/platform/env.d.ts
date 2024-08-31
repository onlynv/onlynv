declare module 'csstype' {
	interface Properties {
		// Add a missing property
		anchorName?: `--${string}`;
		positionAnchor?: string;

		// Allow any CSS Custom Properties
		[index: `--${string}`]: string;
	}
}
