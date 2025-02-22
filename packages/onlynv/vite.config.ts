import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: { index: 'src/index.ts', config: 'src/config.ts' },
			name: 'onlynv',
			fileName: (_, name) => `${name}.js`,
			formats: ['es', 'cjs']
		},
		rollupOptions: {
			external: builtinModules.concat(builtinModules.map((m) => `node:${m}`))
		}
	}
});
