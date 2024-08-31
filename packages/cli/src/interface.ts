import pc from '@onlynv/shared/colors';

const commands = [
	{
		name: 'version',
		shortName: 'v',
		description: 'Get the version of the CLI',
		flags: []
	},
	{
		name: 'init',
		shortName: 'i',
		description: 'Initialise a new project',
		flags: [
			{
				name: 'name',
				description: 'Name of the project',
				required: false,
				expectsValue: true
			},
			{
				name: 'dry-run',
				description: 'Dry run the command',
				expectsValue: false,
				required: false
			}
		]
	},
	{
		name: 'sync',
		shortName: 's',
		description: 'Sync your environment downstream',
		flags: [
			{
				name: 'dry-run',
				description: 'Dry run the command',
				expectsValue: false,
				required: false
			}
		]
	}
] as const satisfies Command[];

export type Command = {
	name: string;
	shortName?: string;
	description: string;
	flags: Flag[];
};

export type Flag = {
	name: string;
	shortName?: string;
	description: string;
	required: boolean;
	expectsValue: boolean;
};

export type Interface = {
	isDefault: boolean;
	command?: Command;
	args: string[];
	flags: Record<(typeof commands)[number]['flags'][number]['name'], string | boolean | undefined>;

	showHelp: () => void;
};

export const createInterface = (): Interface => {
	const args = process.argv.slice(2);

	const command = args.find((arg) =>
		commands.some((c) => c.name === arg || c.shortName === arg || `-${c.shortName}` === arg)
	);

	return {
		isDefault: command === undefined,
		command: commands.find(
			(c) => c.name === command || c.shortName === command || `-${c.shortName}` === command
		),
		args,
		flags: args.reduce(
			(acc, arg, i) => {
				const cmd = commands.find(
					(c) =>
						c.name === command ||
						c.shortName === command ||
						`-${c.shortName}` === command
				);

				if (!cmd) return acc;

				const flag = cmd.flags.find((f) => f.name === args[i + 1]);

				if (!flag) return acc;

				acc[flag.name] = (flag as Flag).expectsValue ? args[i + 2] : true;

				return acc;
			},
			{} as Interface['flags']
		),
		showHelp: () => {
			console.log(`Usage: nv ${pc.green('<command>')} ${pc.cyan('[options]')}\n`);

			console.log('Commands:');

			for (const c of commands) {
				const shortName = c.shortName ? `-${c.shortName}` : '';

				const start = `  ${pc.green(c.name)} (${pc.yellow(shortName)})`.padEnd(36);
				const end = `${c.description} ${c.flags.some((f) => f.required) ? '(required)' : ''}`;

				console.log(start + end);

				for (const f of c.flags) {
					console.log(
						`    ${pc.cyan(f.name)} ${
							'shortName' in f ? `(${pc.yellow('-' + f.shortName!)})` : ''
						}`.padEnd(30) +
							f.description +
							(f.required ? ' (required)' : '')
					);
				}
			}
		}
	};
};
