'use server';

import { db, initTable, projectsTable } from 'platform/src/lib/db';
import { eq } from 'drizzle-orm';

import styles from './projects.module.scss';
import { EmptyState } from 'platform/src/components/EmptyState';
import { Button } from 'platform/src/components/Button';

export const Project = async ({ id }: { id: string }) => {
	const res = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);

	if (!res.length || !res[0]) {
		return (
			<EmptyState
				title="Project not found"
				description="The project you are looking for does not exist"
			/>
		);
	}

	return <div className={styles.createproject}>{res[0].name}</div>;
};
