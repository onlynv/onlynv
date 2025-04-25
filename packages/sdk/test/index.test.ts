import { config } from 'onlynv';
import { describe, expect, test } from 'vitest';

import { type Credentials, OnlyNv } from '../src';

config();

const credentials: Credentials = {
	token: process.env.BEARER!,
	remote: process.env.REMOTE!,
	local: {
		publicKey: process.env.PUBLIC!,
		privateKey: process.env.PRIVATE!
	}
};

describe('OnlyNv', async () => {
	test('should be defined', () => {
		expect(OnlyNv).toBeDefined();
		expect(OnlyNv.prototype).toBeDefined();
		expect(OnlyNv.prototype.constructor).toBeDefined();
	});

	test('should be a class', () => {
		expect(OnlyNv.prototype.constructor.name).toBe('OnlyNv');
	});

	test('should be instantiable', () => {
		const instance = new OnlyNv({ authentication: credentials });
	});

	const instance = new OnlyNv({ authentication: credentials });

	describe('ping', async () => {
		test('should be defined', () => {
			expect(instance.ping).toBeDefined();
			expect(typeof instance.ping).toBe('function');
		});

		test('should return a promise', () => {
			const result = instance.ping();

			expect(result).toBeInstanceOf(Promise);
		});

		const result = instance.ping();

		test('should return a response', async () => {
			const awaitedResult = await result;

			expect(awaitedResult).toBeDefined();
			expect(awaitedResult.data).toBeDefined();
			expect(awaitedResult.error).toBeNull();
		});

		test('should return a response with data', async () => {
			const awaitedResult = await result;

			expect(awaitedResult.data).toBeDefined();
			expect(awaitedResult.data).toBeInstanceOf(Object);
			expect(awaitedResult.data).toHaveProperty('latency');
			expect(awaitedResult.data?.latency).toBeTypeOf('number');
			expect(awaitedResult.data).toHaveProperty('isAuth');
			expect(awaitedResult.data?.isAuth).toBeTypeOf('boolean');
		});
	});
});
