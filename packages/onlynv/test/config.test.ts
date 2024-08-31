import { test, expect } from 'vitest';

import { config } from '../src';

const res = config({ experimentalGlob: true });

test('should not error', () => {
	expect(res.error).toBeUndefined();
});

test('should error on missing file', () => {
	const res = config({ path: './test/.env.missing' });

	expect(res.error).toBeInstanceOf(Error);
});

test('should parse a relative path', () => {
	const res = config({ path: './test/.env' });

	expect(res.error).toBeUndefined();
	expect(res.parsed).toBeTypeOf('object');
});

if (process.version.startsWith('v22.')) {
	test('should parse glob', () => {
		const res = config({ experimentalGlob: true });

		expect(res.error).toBeUndefined();
		expect(res.parsed).toBeTypeOf('object');
	});
}

test('should return an object', () => {
	expect(process.env).toBeTypeOf('object');
});

test('sets basic environment variable', () => {
	expect(process.env.BASIC).toBe('basic');
});

test('reads after a skipped line', () => {
	expect(process.env.AFTER_LINE).toBe('after_line');
});

test('defaults empty values to empty string', () => {
	expect(process.env.EMPTY).toBe('');
});

test('escapes single quoted values', () => {
	expect(process.env.SINGLE_QUOTES).toBe('single_quotes');
});

test('respects surrounding spaces in single quotes', () => {
	expect(process.env.SINGLE_QUOTES_SPACED).toBe('    single quotes    ');
});

test('escapes double quoted values', () => {
	expect(process.env.DOUBLE_QUOTES).toBe('double_quotes');
});

test('respects surrounding spaces in double quotes', () => {
	expect(process.env.DOUBLE_QUOTES_SPACED).toBe('    double quotes    ');
});

test('expands newlines but only if double quoted', () => {
	expect(process.env.EXPAND_NEWLINES).toBe('expand\nnew\nlines');
});

test('expands newlines but only if double quoted', () => {
	expect(process.env.DONT_EXPAND_UNQUOTED).toBe('dontexpand\\nnewlines');
});

test('expands newlines but only if double quoted', () => {
	expect(process.env.DONT_EXPAND_SQUOTED).toBe('dontexpand\\nnewlines');
});

test('ignores commented lines', () => {
	expect(process.env.COMMENTS).toBeUndefined();
});

test('respects equals signs in values', () => {
	expect(process.env.EQUAL_SIGNS).toBe('equals==');
});

test('retains inner quotes', () => {
	expect(process.env.RETAIN_INNER_QUOTES).toBe('{"foo": "bar"}');
});

test('retains inner quotes', () => {
	expect(process.env.RETAIN_INNER_QUOTES_AS_STRING).toBe('{"foo": "bar"}');
});

test('retains spaces in string', () => {
	expect(process.env.TRIM_SPACE_FROM_UNQUOTED).toBe('some spaced out string');
});

test('parses email addresses completely', () => {
	expect(process.env.USERNAME).toBe('therealnerdybeast@example.tld');
});

test('parses keys and values surrounded by spaces', () => {
	expect(process.env.SPACED_KEY).toBe('parsed');
});

test('parses multi-line strings when using double quotes', () => {
	expect(process.env.MULTI_DOUBLE_QUOTED).toBe('THIS\nIS\nA\nMULTILINE\nSTRING');
});

test('parses multi-line strings when using single quotes', () => {
	expect(process.env.MULTI_SINGLE_QUOTED).toBe('THIS\nIS\nA\nMULTILINE\nSTRING');
});

test('parses multi-line strings when using backticks', () => {
	expect(process.env.MULTI_BACKTICKED).toBe('THIS\nIS\nA\n"MULTILINE\'S"\nSTRING');
});

const multiPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnNl1tL3QjKp3DZWM0T3u
LgGJQwu9WqyzHKZ6WIA5T+7zPjO1L8l3S8k8YzBrfH4mqWOD1GBI8Yjq2L1ac3Y/
bTdfHN8CmQr2iDJC0C6zY8YV93oZB3x0zC/LPbRYpF8f6OqX1lZj5vo2zJZy4fI/
kKcI5jHYc8VJq+KCuRZrvn+3V+KuL9tF9v8ZgjF2PZbU+LsCy5Yqg1M8f5Jp5f6V
u4QuUoobAgMBAAE=
-----END PUBLIC KEY-----`;

test('parses multi-line strings when using double quotes', () => {
	expect(process.env.MULTI_PEM_DOUBLE_QUOTED).toBe(multiPem);
});
