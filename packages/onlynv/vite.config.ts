import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: { index: 'src/index.ts', config: 'src/config.ts' },
			name: 'onlynv',
			fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
			formats: ['es', 'cjs']
		},
		rollupOptions: {
			external: builtinModules.concat(builtinModules.map((m) => `node:${m}`))
		}
	}
});
