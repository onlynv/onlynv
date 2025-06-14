import pc from '@onlynv/shared/colors';

const commands = [
	{
		name: 'version',
		shortName: '-v',
		description: 'Get the version of the CLI',
		flags: [],
		subcommands: []
	},
	{
		name: 'help',
		shortName: '-h',
		description: 'Show this help message',
		flags: [],
		subcommands: []
	},
	{
		name: 'ping',
		shortName: 'p',
		description: 'Ping the platform',
		flags: [],
		subcommands: []
	},
	{
		name: 'link',
		shortName: 'l',
		description: "Link your project's environment",
		flags: [
			{
				name: 'id',
				description: 'The id of the project to link',
				allowSolo: true,
				required: false,
				expectsValue: true
			}
		],
		subcommands: []
	},
	{
		name: 'init',
		shortName: 'i',
		description: 'Initialise a new project',
		flags: [
			{
				name: 'authority',
				description: 'The authority URL where you would like to init a project.',
				allowSolo: true,
				required: false,
				expectsValue: true
			}
		],
		subcommands: []
	},
	{
		name: 'glob',
		shortName: 'g',
		description: 'Search for included files',
		flags: [],
		subcommands: []
	},
	{
		name: 'open',
		shortName: 'o',
		description: 'Open the project in the browser',
		flags: [],
		subcommands: []
	},
	{
		name: 'sync',
		shortName: 's',
		description: 'Sync your environment downstream',
		flags: [
			{
				name: 'strategy',
				description: 'The strategy to use for syncing',
				allowSolo: true,
				expectsValue: true,
				required: false
			},
			{
				name: 'dry-run',
				description: 'Dry run the command',
				allowSolo: false,
				expectsValue: false,
				required: false
			},
			{
				name: 'skip-ci',
				description: 'Skip CI sync',
				allowSolo: false,
				expectsValue: false,
				required: false
			}
		],
		subcommands: []
	},
	{
		name: 'type',
		shortName: 't',
		description: 'Generate types for your environment',
		flags: [
			{
				name: 'target',
				description: 'The target language for the types',
				allowSolo: true,
				expectsValue: true,
				required: false
			},
			{
				name: 'dry-run',
				description: 'Dry run the command',
				allowSolo: false,
				expectsValue: false,
				required: false
			}
		],
		subcommands: []
	},
	{
		name: 'strip',
		shortName: 'r',
		description: 'Generate a blank environment file, stripping all secrets',
		flags: [
			{
				name: 'file',
				description: 'The file to strip',
				allowSolo: true,
				expectsValue: true,
				required: true
			}
		],
		subcommands: []
	},
	{
		name: 'stow',
		shortName: 'k',
		description: 'Manage your authentication methods',
		subcommands: [
			{
				name: 'add',
				description: 'Add a new key',
				flags: [
					{
						name: 'key',
						description: 'The key itself',
						required: true,
						allowSolo: true,
						expectsValue: true
					},
					{
						name: 'name',
						shortName: 'n',
						description: 'Name of the key',
						required: false,
						allowSolo: false,
						expectsValue: true
					}
				],
				subcommands: []
			},
			{
				name: 'remove',
				description: 'Remove a key',
				flags: [
					{
						name: 'id',
						description: 'id or name of the key',
						required: true,
						allowSolo: true,
						expectsValue: true
					}
				],
				subcommands: []
			},
			{
				name: 'get',
				description: 'Get a key',
				flags: [
					{
						name: 'id',
						description: 'id or name of the key',
						required: true,
						allowSolo: true,
						expectsValue: true
					}
				],
				subcommands: []
			},
			{
				name: 'list',
				description: 'List all keys',
				flags: [],
				subcommands: []
			}
		],
		flags: []
	}
] as const satisfies Command[];

export type Command = {
	name: string;
	shortName?: string;
	description: string;
	flags: Flag[];
	subcommands: Command[];
};

export type Flag = {
	name: string;
	shortName?: string;
	description: string;
	allowSolo: boolean;
	required: boolean;
	expectsValue: boolean;
};

export type Interface = {
	isDefault: boolean;
	command?: Command & { name: (typeof commands)[number]['name'] };
	subcommand?: Command & { name: (typeof commands)[number]['subcommands'][number]['name'] };
	args: string[];
	flags: Record<
		| (typeof commands)[number]['flags'][number]['name']
		| (typeof commands)[number]['subcommands'][number]['flags'][number]['name'],
		string | boolean | undefined
	>;

	showHelp: () => void;
};

export const createInterface = (): Interface => {
	const args = process.argv.slice(2);

	const command = args.find((arg) => commands.some((c) => c.name === arg || c.shortName === arg));

	return {
		isDefault: command === undefined,
		command: commands.find((c) => c.name === command || c.shortName === command),
		args,
		flags: getFlags(args),
		subcommand: commands
			.map((c) => c.subcommands)
			.flat()
			.find((c) => c.name === args[1]),

		showHelp: () => {
			console.log(`Usage: nv ${pc.green('<command>')} ${pc.cyan('[options]')}\n`);

			console.log('Commands:');

			for (const c of commands) {
				const start = `  ${pc.green(
					c.name + ('shortName' in c ? `, ${c.shortName}` : '')
				)}`.padEnd(36);
				const end = `${c.description} ${c.flags.some((f) => f.required) ? pc.red('(required)') : ''}`;

				console.log(start + end);

				for (const f of c.flags) {
					console.log(
						`    ${pc.cyan(
							'--' + f.name + ('shortName' in f ? `, ${f.shortName as string}` : '')
						)}`.padEnd(40) +
							f.description +
							(f.required ? pc.red(' (required)') : '')
					);
				}

				for (const sc of c.subcommands) {
					console.log(`    ${pc.green(sc.name)}`.padEnd(40) + sc.description);

					for (const f of sc.flags) {
						console.log(
							`      ${pc.cyan(
								'--' + f.name + ('shortName' in f ? `, -${f.shortName}` : '')
							)}`.padEnd(42) +
								f.description +
								(f.required ? pc.red(' (required)') : '')
						);
					}
				}
			}
		}
	};
};

const getFlags = (args: string[]): Record<string, string | boolean | undefined> => {
	const flags: Record<string, string | boolean | undefined> = {};

	const isSubcommand = commands.some((c) => c.subcommands.some((sc) => sc.name === args[1]));

	const command =
		isSubcommand ?
			commands.flatMap((c) => c.subcommands).find((sc) => sc.name === args[1])
		:	commands.find((c) => c.name === args[0] || c.shortName === args[0]);

	if (!command) return flags;

	const flagList = command.flags;

	for (let i = isSubcommand ? 2 : 1; i < args.length; i++) {
		const arg = args[i];

		if (!arg) continue;

		const flag = flagList.find(
			(f) =>
				f.name === arg ||
				'--' + f.name === arg ||
				('shortName' in f && (f.shortName === arg || '-' + f.shortName === arg))
		);

		if (!flag) {
			const solo = flagList.find((f) => f.allowSolo);

			if (solo) {
				if (flags[solo.name]) continue;

				flags[solo.name] = arg;
				continue;
			}
			continue;
		}

		if (flag.expectsValue) {
			const nextArg = args[i + 1];

			if (nextArg && !nextArg.startsWith('-')) {
				flags[flag.name] = nextArg;
			} else {
				flags[flag.name] = true;
			}
		} else {
			flags[flag.name] = true;
		}
	}

	return flags;
};
