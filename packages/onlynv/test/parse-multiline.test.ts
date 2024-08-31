import { test, expect } from 'vitest';

import { parse } from '../src/parse';

const dotenvtest = `BASIC=basic

# previous line intentionally left blank
AFTER_LINE=after_line
EMPTY=
SINGLE_QUOTES='single_quotes'
SINGLE_QUOTES_SPACED='    single quotes    '
DOUBLE_QUOTES="double_quotes"
DOUBLE_QUOTES_SPACED="    double quotes    "
EXPAND_NEWLINES="expand\\nnew\\nlines"
DONT_EXPAND_UNQUOTED=dontexpand\\nnewlines
DONT_EXPAND_SQUOTED='dontexpand\\nnewlines'
# COMMENTS=work
EQUAL_SIGNS=equals==
RETAIN_INNER_QUOTES={"foo": "bar"}

RETAIN_INNER_QUOTES_AS_STRING='{"foo": "bar"}'
TRIM_SPACE_FROM_UNQUOTED=    some spaced out string
USERNAME=therealnerdybeast@example.tld
    SPACED_KEY = parsed

MULTI_DOUBLE_QUOTED="THIS
IS
A
MULTILINE
STRING"

MULTI_SINGLE_QUOTED='THIS
IS
A
MULTILINE
STRING'

MULTI_BACKTICKED=\`THIS
IS
A
"MULTILINE'S"
STRING\`

MULTI_PEM_DOUBLE_QUOTED="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnNl1tL3QjKp3DZWM0T3u
LgGJQwu9WqyzHKZ6WIA5T+7zPjO1L8l3S8k8YzBrfH4mqWOD1GBI8Yjq2L1ac3Y/
bTdfHN8CmQr2iDJC0C6zY8YV93oZB3x0zC/LPbRYpF8f6OqX1lZj5vo2zJZy4fI/
kKcI5jHYc8VJq+KCuRZrvn+3V+KuL9tF9v8ZgjF2PZbU+LsCy5Yqg1M8f5Jp5f6V
u4QuUoobAgMBAAE=
-----END PUBLIC KEY-----"`;

const parsed = parse(dotenvtest);

test('should return an object', () => {
	expect(parsed).toBeTypeOf('object');
});

test('sets basic environment variable', () => {
	expect(parsed.BASIC).toBe('basic');
});

test('reads after a skipped line', () => {
	expect(parsed.AFTER_LINE).toBe('after_line');
});

test('defaults empty values to empty string', () => {
	expect(parsed.EMPTY).toBe('');
});

test('escapes single quoted values', () => {
	expect(parsed.SINGLE_QUOTES).toBe('single_quotes');
});

test('respects surrounding spaces in single quotes', () => {
	expect(parsed.SINGLE_QUOTES_SPACED).toBe('    single quotes    ');
});

test('escapes double quoted values', () => {
	expect(parsed.DOUBLE_QUOTES).toBe('double_quotes');
});

test('respects surrounding spaces in double quotes', () => {
	expect(parsed.DOUBLE_QUOTES_SPACED).toBe('    double quotes    ');
});

test('expands newlines but only if double quoted', () => {
	expect(parsed.EXPAND_NEWLINES).toBe('expand\nnew\nlines');
});

test('expands newlines but only if double quoted', () => {
	expect(parsed.DONT_EXPAND_UNQUOTED).toBe('dontexpand\\nnewlines');
});

test('expands newlines but only if double quoted', () => {
	expect(parsed.DONT_EXPAND_SQUOTED).toBe('dontexpand\\nnewlines');
});

test('ignores commented lines', () => {
	expect(parsed.COMMENTS).toBeUndefined();
});

test('respects equals signs in values', () => {
	expect(parsed.EQUAL_SIGNS).toBe('equals==');
});

test('retains inner quotes', () => {
	expect(parsed.RETAIN_INNER_QUOTES).toBe('{"foo": "bar"}');
});

test('retains inner quotes', () => {
	expect(parsed.RETAIN_INNER_QUOTES_AS_STRING).toBe('{"foo": "bar"}');
});

test('retains spaces in string', () => {
	expect(parsed.TRIM_SPACE_FROM_UNQUOTED).toBe('some spaced out string');
});

test('parses email addresses completely', () => {
	expect(parsed.USERNAME).toBe('therealnerdybeast@example.tld');
});

test('parses keys and values surrounded by spaces', () => {
	expect(parsed.SPACED_KEY).toBe('parsed');
});

test('parses multi-line strings when using double quotes', () => {
	expect(parsed.MULTI_DOUBLE_QUOTED).toBe('THIS\nIS\nA\nMULTILINE\nSTRING');
});

test('parses multi-line strings when using single quotes', () => {
	expect(parsed.MULTI_SINGLE_QUOTED).toBe('THIS\nIS\nA\nMULTILINE\nSTRING');
});

test('parses multi-line strings when using backticks', () => {
	expect(parsed.MULTI_BACKTICKED).toBe('THIS\nIS\nA\n"MULTILINE\'S"\nSTRING');
});

const multiPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnNl1tL3QjKp3DZWM0T3u
LgGJQwu9WqyzHKZ6WIA5T+7zPjO1L8l3S8k8YzBrfH4mqWOD1GBI8Yjq2L1ac3Y/
bTdfHN8CmQr2iDJC0C6zY8YV93oZB3x0zC/LPbRYpF8f6OqX1lZj5vo2zJZy4fI/
kKcI5jHYc8VJq+KCuRZrvn+3V+KuL9tF9v8ZgjF2PZbU+LsCy5Yqg1M8f5Jp5f6V
u4QuUoobAgMBAAE=
-----END PUBLIC KEY-----`;

test('parses multi-line strings when using double quotes', () => {
	expect(parsed.MULTI_PEM_DOUBLE_QUOTED).toBe(multiPem);
});
