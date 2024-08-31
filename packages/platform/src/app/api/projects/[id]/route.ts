import { type ProjectResponse } from '@onlynv/shared/structs/init';
import { db, projectsTable } from 'platform/src/lib/db';
import { eq } from 'drizzle-orm';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
	try {
		const res = await db
			.select()
			.from(projectsTable)
			.where(eq(projectsTable.id, params.id))
			.limit(1);

		if (!res.length || !res[0]) {
			return Response.json(
				{
					error: 'Project not found'
				},
				{
					status: 404
				}
			);
		}

		return Response.json({
			name: res[0].name,
			id: res[0].id,
			project_url: res[0].project_url
		} satisfies ProjectResponse);
	} catch (e) {
		return Response.json(
			{
				error: e
			},
			{
				status: 500
			}
		);
	}
};
