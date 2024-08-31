import styles from './emptystate.module.scss';

export const EmptyState = (props: { title: string; description: string }) => {
	return (
		<div className={styles.emptystate}>
			<h1 className={styles.title}>{props.title}</h1>
			<p className={styles.desc}>{props.description}</p>
		</div>
	);
};
