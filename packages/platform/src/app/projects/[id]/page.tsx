import { Suspense, use } from 'react';

import { EmptyState } from 'platform/src/components/EmptyState';

import styles from '../../page.module.scss';
import { Project } from './components';

export default function Page({ params }: { params: { id: string } }) {
	return (
		<main className={styles.main}>
			<Suspense
				fallback={
					<EmptyState
						title="Loading project"
						description="Please wait while we load the project"
					/>
				}
			>
				<Project id={params.id}></Project>
			</Suspense>
		</main>
	);
}
