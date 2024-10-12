import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: 'esnext',
		lib: {
			entry: 'src/index.ts',
			name: 'cli',
			fileName: 'bin',
			formats: ['es']
		},
		rollupOptions: {
			external: builtinModules.concat(builtinModules.map((m) => `node:${m}`))
		}
	}
});
