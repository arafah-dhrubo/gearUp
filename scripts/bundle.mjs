import { build } from 'esbuild';

await build({
  entryPoints: ['src/entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  outfile: 'api/index.js',
});
