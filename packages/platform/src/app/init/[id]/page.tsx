import { db, initTable } from 'platform/src/lib/db';

import { Suspense, use } from 'react';
import { CreateProject } from './components';
import { EmptyState } from 'platform/src/components/EmptyState';

import styles from '../../page.module.scss';

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
				<CreateProject id={params.id}></CreateProject>
			</Suspense>
		</main>
	);
}
