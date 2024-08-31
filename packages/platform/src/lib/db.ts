import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);

export const initTable = pgTable('init_table', {
	id: text('id').primaryKey(),
	status: text('status'),
	metadata: jsonb('metadata').notNull(),
	url: text('url'),
	project_url: text('project_url'),
	interval: integer('interval'),
	timestamp: timestamp('timestamp').default(sql`now()`)
});

export const projectsTable = pgTable('projects_table', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	owner: text('owner').notNull(),
	recovery: text('recovery').notNull(),
	project_url: text('project_url'),
	timestamp: timestamp('created_at').default(sql`now()`)
});
