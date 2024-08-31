import prompts from 'prompts';

export const getConfirmation = async (
	question: string,
	defaultAnswer: boolean
): Promise<boolean> => {
	const response = await prompts({
		type: 'confirm',
		name: 'value',
		message: question,
		initial: defaultAnswer
	});

	return response.value;
};
