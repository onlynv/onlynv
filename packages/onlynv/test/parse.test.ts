import { expect, test } from 'vitest';

import { parse } from '../src/parse';

const dotenvtest = `BASIC=basic

# previous line intentionally left blank
AFTER_LINE=after_line
EMPTY=
EMPTY_SINGLE_QUOTES=''
EMPTY_DOUBLE_QUOTES=""
EMPTY_BACKTICKS=\`\`
SINGLE_QUOTES='single_quotes'
SINGLE_QUOTES_SPACED='    single quotes    '
DOUBLE_QUOTES="double_quotes"
DOUBLE_QUOTES_SPACED="    double quotes    "
DOUBLE_QUOTES_INSIDE_SINGLE='double "quotes" work inside single quotes'
DOUBLE_QUOTES_WITH_NO_SPACE_BRACKET="{ port: $MONGOLAB_PORT}"
SINGLE_QUOTES_INSIDE_DOUBLE="single 'quotes' work inside double quotes"
BACKTICKS_INSIDE_SINGLE='\`backticks\` work inside single quotes'
BACKTICKS_INSIDE_DOUBLE="\`backticks\` work inside double quotes"
BACKTICKS=\`backticks\`
BACKTICKS_SPACED=\`    backticks    \`
DOUBLE_QUOTES_INSIDE_BACKTICKS=\`double "quotes" work inside backticks\`
SINGLE_QUOTES_INSIDE_BACKTICKS=\`single 'quotes' work inside backticks\`
DOUBLE_AND_SINGLE_QUOTES_INSIDE_BACKTICKS=\`double "quotes" and single 'quotes' work inside backticks\`
EXPAND_NEWLINES="expand\\nnew\\nlines"
DONT_EXPAND_UNQUOTED=dontexpand\\nnewlines
DONT_EXPAND_SQUOTED='dontexpand\\nnewlines'
# COMMENTS=work
INLINE_COMMENTS=inline comments # work #very #well
INLINE_COMMENTS_SINGLE_QUOTES='inline comments outside of #singlequotes' # work
INLINE_COMMENTS_DOUBLE_QUOTES="inline comments outside of #doublequotes" # work
INLINE_COMMENTS_BACKTICKS=\`inline comments outside of #backticks\` # work
INLINE_COMMENTS_SPACE=inline comments start with a#number sign. no space required.
EQUAL_SIGNS=equals==
RETAIN_INNER_QUOTES={"foo": "bar"}
RETAIN_INNER_QUOTES_AS_STRING='{"foo": "bar"}'
RETAIN_INNER_QUOTES_AS_BACKTICKS=\`{"foo": "bar's"}\`
TRIM_SPACE_FROM_UNQUOTED=    some spaced out string
USERNAME=therealnerdybeast@example.tld
    SPACED_KEY = parsed`;

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
	expect(parsed.EMPTY_SINGLE_QUOTES).toBe('');
	expect(parsed.EMPTY_DOUBLE_QUOTES).toBe('');
	expect(parsed.EMPTY_BACKTICKS).toBe('');
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

test('respects double quotes inside single quotes', () => {
	expect(parsed.DOUBLE_QUOTES_INSIDE_SINGLE).toBe('double "quotes" work inside single quotes');
});

test('respects spacing for badly formed brackets', () => {
	expect(parsed.DOUBLE_QUOTES_WITH_NO_SPACE_BRACKET).toBe('{ port: $MONGOLAB_PORT}');
});

test('respects single quotes inside double quotes', () => {
	expect(parsed.SINGLE_QUOTES_INSIDE_DOUBLE).toBe("single 'quotes' work inside double quotes");
});

test('respects backticks inside single quotes', () => {
	expect(parsed.BACKTICKS_INSIDE_SINGLE).toBe('`backticks` work inside single quotes');
});

test('respects backticks inside double quotes', () => {
	expect(parsed.BACKTICKS_INSIDE_DOUBLE).toBe('`backticks` work inside double quotes');
});

test('backticks', () => {
	expect(parsed.BACKTICKS).toBe('backticks');
});

test('backticks spaced', () => {
	expect(parsed.BACKTICKS_SPACED).toBe('    backticks    ');
});

test('respects double quotes inside backticks', () => {
	expect(parsed.DOUBLE_QUOTES_INSIDE_BACKTICKS).toBe('double "quotes" work inside backticks');
});

test('respects single quotes inside backticks', () => {
	expect(parsed.SINGLE_QUOTES_INSIDE_BACKTICKS).toBe("single 'quotes' work inside backticks");
});

test('respects single quotes inside backticks', () => {
	expect(parsed.DOUBLE_AND_SINGLE_QUOTES_INSIDE_BACKTICKS).toBe(
		'double "quotes" and single \'quotes\' work inside backticks'
	);
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

test('ignores inline comments', () => {
	expect(parsed.INLINE_COMMENTS).toBe('inline comments');
});

test('ignores inline comments and respects # character inside of single quotes', () => {
	expect(parsed.INLINE_COMMENTS_SINGLE_QUOTES).toBe('inline comments outside of #singlequotes');
});

test('ignores inline comments and respects # character inside of double quotes', () => {
	expect(parsed.INLINE_COMMENTS_DOUBLE_QUOTES).toBe('inline comments outside of #doublequotes');
});

test('ignores inline comments and respects # character inside of backticks', () => {
	expect(parsed.INLINE_COMMENTS_BACKTICKS).toBe('inline comments outside of #backticks');
});

test('treats # character as start of comment', () => {
	expect(parsed.INLINE_COMMENTS_SPACE).toBe('inline comments start with a');
});

test('respects equals signs in values', () => {
	expect(parsed.EQUAL_SIGNS).toBe('equals==');
});

test('retains inner quotes', () => {
	expect(parsed.RETAIN_INNER_QUOTES).toBe('{"foo": "bar"}');
	expect(parsed.RETAIN_INNER_QUOTES_AS_STRING).toBe('{"foo": "bar"}');
	expect(parsed.RETAIN_INNER_QUOTES_AS_BACKTICKS).toBe('{"foo": "bar\'s"}');
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
