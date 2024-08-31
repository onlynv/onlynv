export type InitResponse = {
	id: string;
	url: string;
	redirect_url: string;
	timestamp: number;
	interval?: number;
};

export type InitStatusResponse = {
	status: 'done' | 'pending';
	timestamp: number;
	project_url?: string;
	interval?: number;
};

export type ProjectResponse = {
	name: string;
	id: string;
	project_url: string | null;
};
