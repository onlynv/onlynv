export const endpoint = (authority: string, path: string): string => {
	const url = new URL(path, authority);

	return url.toString();
};
