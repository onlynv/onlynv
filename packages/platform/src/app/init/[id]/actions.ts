'use server';

import { db, initTable, projectsTable } from 'platform/src/lib/db';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const removeProject = async ({ id }: { id: string }) => {
	await db.delete(initTable).where(eq(initTable.id, id));

	console.log('Project removed');

	redirect('/');
};

export const createProject = async ({
	id,
	name,
	recovery,
	url
}: {
	id: string;
	name: string;
	recovery: string;
	url: string;
}) => {
	await db
		.update(initTable)
		.set({
			status: 'done',
			project_url: url
		})
		.where(eq(initTable.id, id));

	await db.insert(projectsTable).values({
		id,
		name,
		owner: 'Unknown',
		recovery,
		project_url: url
	});
};
