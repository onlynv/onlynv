import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: 'esnext',
		lib: {
			entry: 'src/index.ts',
			name: 'sdk',
			fileName: 'index',
			formats: ['es', 'cjs']
		},
		rollupOptions: {
			external: builtinModules.concat(builtinModules.map((m) => `node:${m}`))
		}
	}
});
