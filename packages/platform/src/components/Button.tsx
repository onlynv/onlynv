'use client';

import cn from 'classnames';

import styles from './button.module.scss';
import { useState } from 'react';

export const Button = (
	props: {
		children: React.ReactNode;
		onClick: () => void | Promise<void>;
		lazyAfterClick?: () => void | Promise<void>;
		className?: string;
		color?: 'primary' | 'secondary' | 'danger' | 'danger-secondary';
	} & {
		[T in keyof React.JSX.IntrinsicElements['button']]:
			| React.JSX.IntrinsicElements['button'][T]
			| undefined;
	}
) => {
	const [loading, setLoading] = useState(false);

	return (
		<button
			{...props}
			onClick={async () => {
				setLoading(true);
				await props.onClick();
				setLoading(false);
				props.lazyAfterClick?.();
			}}
			className={cn(
				styles.button,
				props.className,
				{
					[styles.loading!]: loading
				},
				{
					[styles.primary!]: props.color === 'primary',
					[styles.secondary!]: props.color === 'secondary',
					[styles.danger!]: props.color === 'danger',
					[styles.dangerSecondary!]: props.color === 'danger-secondary'
				}
			)}
		>
			{props.children}
		</button>
	);
};
