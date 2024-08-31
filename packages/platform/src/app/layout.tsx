import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
	title: 'OnlyNv',
	description: 'Your environment, your way'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
