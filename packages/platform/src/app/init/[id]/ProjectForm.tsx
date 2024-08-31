'use client';

import { initTable } from 'platform/src/lib/db';

import styles from './init.module.scss';
import { useState } from 'react';
import classNames from 'classnames';

import { TextInput } from 'platform/src/components/TextInput';
import { Button } from 'platform/src/components/Button';
import { createProject } from './actions';
import { redirect } from 'next/navigation';

const availableIntegrations = [
	{
		id: 'github',
		name: 'GitHub',
		description: "The world's leading AI-powered developer platform.",
		color: '#0969DA'
	},
	{
		id: 'vercel',
		name: 'Vercel',
		description: 'Your complete platform for the web.',
		color: '#fff'
	},
	{
		id: 'netlify',
		name: 'Netlify',
		description:
			'The essential platform for the delivery of exceptional and dynamic web experiences, without limitations.',
		color: '#33E6E2'
	}
];

export const ProjectForm = ({ init }: { init: typeof initTable.$inferSelect }) => {
	const [integrations, setIntegrations] = useState<number[]>([]);
	const [name, setName] = useState<string>(
		typeof init.metadata === 'object' && 'name' in init.metadata! ?
			(init.metadata.name as string)
		:	''
	);
	const [recovery, setRecovery] = useState('');

	return (
		<>
			<div className={styles.integrationForm}>
				<h2 className={styles.integrationFormHeader}>Continuous Integration</h2>
				<div className={styles.integrationFormItems}>
					{availableIntegrations.map((integration, index) => (
						<button
							className={classNames(styles.integrationFormItem, {
								[styles.integrationFormItemSelected!]: integrations.includes(index)
							})}
							style={{
								'--color': integration.color
							}}
							key={integration.id}
							onClick={() => {
								if (integrations.includes(index)) {
									setIntegrations(integrations.filter((i) => i !== index));
								} else {
									setIntegrations([...integrations, index]);
								}
							}}
						>
							<div className={styles.integrationFormItemContent}>
								<div className={styles.integrationFormItemHeader}>
									{integration.name}
								</div>
								<div className={styles.integrationFormItemDesc}>
									{integration.description}
								</div>
							</div>
						</button>
					))}
				</div>
				{integrations.map((index) => (
					<div key={index} className={styles.integrationFormSelected}>
						{availableIntegrations[index]!.name}
					</div>
				))}
			</div>
			<form className={styles.projectForm}>
				<TextInput
					label="Project Name"
					placeholder="My Awesome Project"
					value={name}
					required
					onChange={(e) => {
						setName(e.target.value);
					}}
				/>
				<TextInput
					label="Recovery Phrase"
					placeholder="•••••••••• ••• ••••••••"
					type="password"
					required
					value={recovery}
					onChange={(e) => {
						setRecovery(e.target.value);
					}}
				/>
				<Button
					color="primary"
					onClick={async () => {
						await createProject({
							id: init.id,
							name,
							url: new URL(`/projects/${init.id}`, window.location.href).href,
							recovery: Array.from(
								new Uint8Array(
									await crypto.subtle.digest(
										'SHA-256',
										new TextEncoder().encode(recovery)
									)
								)
							)
								.map((b) => b.toString(16).padStart(2, '0'))
								.join('')
						}).catch(console.error);

						redirect(`/projects/${init.id}`);
					}}
					className={styles.projectFormButton}
				>
					Create Project
				</Button>
			</form>
		</>
	);
};
