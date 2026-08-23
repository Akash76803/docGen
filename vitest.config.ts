import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['packages/**/test/**/*.test.ts', 'apps/**/test/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@document-tool/contracts': path.resolve(root, 'packages/contracts/src'),
      '@document-tool/datasource-sdk': path.resolve(root, 'packages/datasource-sdk/src'),
      '@document-tool/datasource-excel': path.resolve(root, 'packages/datasource-excel/src'),
      '@document-tool/datasource-csv': path.resolve(root, 'packages/datasource-csv/src'),
      '@document-tool/core': path.resolve(root, 'packages/core/src'),
      '@document-tool/mapping-engine': path.resolve(root, 'packages/mapping-engine/src'),
      '@document-tool/grouping-engine': path.resolve(root, 'packages/grouping-engine/src'),
      '@document-tool/template-engine': path.resolve(root, 'packages/template-engine/src'),
      '@document-tool/persistence': path.resolve(root, 'packages/persistence/src'),
      '@document-tool/renderer-sdk': path.resolve(root, 'packages/renderer-sdk/src'),
      '@document-tool/renderer-image': path.resolve(root, 'packages/renderer-image/src'),
    },
  },
});
