export type Credentials = {
	token: string;
	remote: string;
	local: {
		publicKey: string;
		privateKey: string;
	};
};
