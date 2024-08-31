'use server';

import { db, initTable } from 'platform/src/lib/db';
import { eq } from 'drizzle-orm';

import styles from './init.module.scss';
import { EmptyState } from 'platform/src/components/EmptyState';
import { Button } from 'platform/src/components/Button';
import { removeProject } from './actions';
import { ProjectForm } from './ProjectForm';

const parseMetadata = (
	metadata: unknown
): {
	sender: string;
	sender_ip: string;
	sender_device: string;
	sender_os: string;
} => {
	if (typeof metadata !== 'object' || !metadata) {
		return {
			sender: 'Unknown',
			sender_ip: 'Unknown',
			sender_device: 'Unknown',
			sender_os: 'Unknown'
		};
	}

	return {
		sender: 'sender' in metadata ? (metadata.sender as string) : 'Unknown',
		sender_ip: 'sender_ip' in metadata ? (metadata.sender_ip as string) : 'Unknown',
		sender_device: 'sender_device' in metadata ? (metadata.sender_device as string) : 'Unknown',
		sender_os: 'sender_os' in metadata ? (metadata.sender_os as string) : 'Unknown'
	};
};

export const CreateProject = async ({ id }: { id: string }) => {
	const res = await db.select().from(initTable).where(eq(initTable.id, id)).limit(1);

	const removeProjectWithId = removeProject.bind(null, { id });

	if (!res.length || !res[0]) {
		return (
			<EmptyState
				title="Project not found"
				description="The project you are looking for does not exist"
			/>
		);
	}

	if (res[0].status !== 'pending') {
		if (parseMetadata(res[0].metadata).sender === '@onlynv/cli') {
			return (
				<EmptyState
					title="Project successfully created"
					description="Return to the CLI to continue"
				/>
			);
		}

		return (
			<EmptyState
				title="Project already created"
				description="The project you are looking for has already been created"
			/>
		);
	}

	return (
		<div className={styles.createproject}>
			<aside className={styles.aside}>
				<h1 className={styles.asideHeader}>Create Project</h1>
				<p className={styles.asideDesc}>
					This request came from {parseMetadata(res[0].metadata).sender_device}, at{' '}
					{parseMetadata(res[0].metadata).sender_ip}. If you don&apos;t recognize this
					device, please close this page immediately.
				</p>
				<Button
					color="danger-secondary"
					className={styles.asideAction}
					onClick={removeProjectWithId}
				>
					Cancel Request
				</Button>
			</aside>
			<main className={styles.main}>
				<ProjectForm init={res[0]} />
			</main>
		</div>
	);
};
