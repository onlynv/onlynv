export const backoffLevel = (
	iterastions: number,
	defaultDelay = 1000,
	maxDelay = 60000,
	factor = 2
) => {
	const delay = defaultDelay * factor ** iterastions;

	if (delay > maxDelay) {
		// indicates to cancel the polling
		return null;
	}

	return delay;
};
