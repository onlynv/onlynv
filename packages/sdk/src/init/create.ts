import type { InitResponse } from '@onlynv/shared/structs/init';

import { endpoint } from '../shared/authority';
import type { Credentials } from '../shared/credentials';
import { type OrError, fail, ok } from '../shared/result';

export type { InitResponse } from '@onlynv/shared/structs/init';

export const create = async (
	credentials: Credentials,
	authority: string,
	metadata?: {
		sender: string;
	} & Record<string, unknown>
): Promise<OrError<InitResponse>> => {
	try {
		const response = await fetch(endpoint(authority, '/api/init'), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${credentials.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...metadata,
				sender: metadata?.sender || '@onlynv/sdk'
			})
		});

		if (response.status === 201) {
			const data = await response.json();

			if (!data || typeof data !== 'object') {
				return fail(new Error('Invalid response format'));
			}

			if ('error' in data) {
				return fail(new Error(`Init creation failed: ${data.error}`));
			}

			return ok(data as InitResponse);
		} else if (response.status === 400) {
			return fail(new Error('Init creation failed: Bad request'));
		} else {
			return fail(new Error(`Init creation failed with status code ${response.status}`));
		}
	} catch (error) {
		return fail(new Error(`Init failed: ${error}`));
	}
};
