export type OrError<T, E = Error> =
	| {
			data: T;
			error: null;
	  }
	| {
			data: null;
			error: E;
	  };

export const fail = <T, E = Error>(error: E): OrError<T, E> => ({
	data: null,
	error: error
});

export const ok = <T, E = Error>(data: T): OrError<T, E> => ({
	data: data,
	error: null
});

export const isOk = <T, E = Error>(result: OrError<T, E>): result is { data: T; error: null } => {
	return result.error === null;
};
