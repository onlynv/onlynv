import { type InitStatusResponse } from '@onlynv/shared/structs/init';
import { db, initTable } from 'platform/src/lib/db';
import { eq } from 'drizzle-orm';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
	try {
		const res = await db.select().from(initTable).where(eq(initTable.id, params.id)).limit(1);

		if (!res.length) {
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
			status: (res[0]?.status as InitStatusResponse['status']) || 'pending',
			interval: (res[0]?.interval as InitStatusResponse['interval']) || 5000,
			project_url: (res[0]?.project_url as InitStatusResponse['project_url']) || undefined,
			timestamp: Date.now()
		} satisfies InitStatusResponse);
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
