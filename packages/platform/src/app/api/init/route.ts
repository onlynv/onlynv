import { type InitResponse } from '@onlynv/shared/structs/init';
import { nanoid } from 'nanoid';
import { db, initTable } from 'platform/src/lib/db';
import { sql } from 'drizzle-orm';

export const POST = async (req: Request) => {
	const uuid = nanoid();

	try {
		const payload = await req.json();

		const data = {
			id: uuid,
			status: 'pending',
			url: new URL(`/api/init/${uuid}`, req.url).toString(),
			project_url: sql`NULL`,
			interval: 5000,
			metadata: payload || {},
			timestamp: new Date()
		};

		try {
			const res = await db.insert(initTable).values(data);

			return Response.json({
				id: uuid,
				url: data.url,
				redirect_url: new URL(`/init/${uuid}`, req.url).toString(),
				interval: data.interval,
				timestamp: data.timestamp.getTime()
			} satisfies InitResponse);
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
	} catch (e) {
		return Response.json(
			{
				error: e
			},
			{
				status: 400
			}
		);
	}
};
