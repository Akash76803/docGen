// vite.config.ts
import { defineConfig } from "file:///E:/Project/Document%20Generator/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Project/Document%20Generator/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath } from "url";
import path from "path";
var __vite_injected_original_import_meta_url = "file:///E:/Project/Document%20Generator/apps/desktop/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react()],
  clearScreen: false,
  resolve: {
    alias: {
      "@document-tool/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
      "@document-tool/datasource-sdk": path.resolve(__dirname, "../../packages/datasource-sdk/src"),
      "@document-tool/datasource-excel": path.resolve(__dirname, "../../packages/datasource-excel/src"),
      "@document-tool/datasource-csv": path.resolve(__dirname, "../../packages/datasource-csv/src"),
      "@document-tool/template-engine": path.resolve(__dirname, "../../packages/template-engine/src"),
      "@document-tool/mapping-engine": path.resolve(__dirname, "../../packages/mapping-engine/src"),
      "@document-tool/grouping-engine": path.resolve(__dirname, "../../packages/grouping-engine/src"),
      "@document-tool/calculation-engine": path.resolve(__dirname, "../../packages/calculation-engine/src"),
      "@document-tool/renderer-sdk": path.resolve(__dirname, "../../packages/renderer-sdk/src"),
      "@document-tool/renderer-pdf": path.resolve(__dirname, "../../packages/renderer-pdf/src"),
      "@document-tool/renderer-image": path.resolve(__dirname, "../../packages/renderer-image/src"),
      "@document-tool/renderer-docx": path.resolve(__dirname, "../../packages/renderer-docx/src"),
      "@document-tool/core": path.resolve(__dirname, "../../packages/core/src"),
      "@document-tool/persistence": path.resolve(__dirname, "../../packages/persistence/src"),
      "@document-tool/design-engine": path.resolve(__dirname, "../../packages/design-engine/src"),
      "@document-tool/validation": path.resolve(__dirname, "../../packages/validation/src")
    }
  },
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxQcm9qZWN0XFxcXERvY3VtZW50IEdlbmVyYXRvclxcXFxhcHBzXFxcXGRlc2t0b3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFByb2plY3RcXFxcRG9jdW1lbnQgR2VuZXJhdG9yXFxcXGFwcHNcXFxcZGVza3RvcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovUHJvamVjdC9Eb2N1bWVudCUyMEdlbmVyYXRvci9hcHBzL2Rlc2t0b3Avdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBjbGVhclNjcmVlbjogZmFsc2UsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0Bkb2N1bWVudC10b29sL2NvbnRyYWN0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jb250cmFjdHMvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvZGF0YXNvdXJjZS1zZGsnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZGF0YXNvdXJjZS1zZGsvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvZGF0YXNvdXJjZS1leGNlbCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kYXRhc291cmNlLWV4Y2VsL3NyYycpLFxuICAgICAgJ0Bkb2N1bWVudC10b29sL2RhdGFzb3VyY2UtY3N2JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2RhdGFzb3VyY2UtY3N2L3NyYycpLFxuICAgICAgJ0Bkb2N1bWVudC10b29sL3RlbXBsYXRlLWVuZ2luZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy90ZW1wbGF0ZS1lbmdpbmUvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvbWFwcGluZy1lbmdpbmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvbWFwcGluZy1lbmdpbmUvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvZ3JvdXBpbmctZW5naW5lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2dyb3VwaW5nLWVuZ2luZS9zcmMnKSxcbiAgICAgICdAZG9jdW1lbnQtdG9vbC9jYWxjdWxhdGlvbi1lbmdpbmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvY2FsY3VsYXRpb24tZW5naW5lL3NyYycpLFxuICAgICAgJ0Bkb2N1bWVudC10b29sL3JlbmRlcmVyLXNkayc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9yZW5kZXJlci1zZGsvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvcmVuZGVyZXItcGRmJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3JlbmRlcmVyLXBkZi9zcmMnKSxcbiAgICAgICdAZG9jdW1lbnQtdG9vbC9yZW5kZXJlci1pbWFnZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9yZW5kZXJlci1pbWFnZS9zcmMnKSxcbiAgICAgICdAZG9jdW1lbnQtdG9vbC9yZW5kZXJlci1kb2N4JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3JlbmRlcmVyLWRvY3gvc3JjJyksXG4gICAgICAnQGRvY3VtZW50LXRvb2wvY29yZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jb3JlL3NyYycpLFxuICAgICAgJ0Bkb2N1bWVudC10b29sL3BlcnNpc3RlbmNlJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3BlcnNpc3RlbmNlL3NyYycpLFxuICAgICAgJ0Bkb2N1bWVudC10b29sL2Rlc2lnbi1lbmdpbmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZGVzaWduLWVuZ2luZS9zcmMnKSxcbiAgICAgICdAZG9jdW1lbnQtdG9vbC92YWxpZGF0aW9uJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3ZhbGlkYXRpb24vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMTQyMCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICB9LFxuICBlbnZQcmVmaXg6IFsnVklURV8nLCAnVEFVUklfJ10sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5UQVVSSV9QTEFURk9STSA9PT0gJ3dpbmRvd3MnID8gJ2Nocm9tZTEwNScgOiAnc2FmYXJpMTMnLFxuICAgIG1pbmlmeTogIXByb2Nlc3MuZW52LlRBVVJJX0RFQlVHID8gJ2VzYnVpbGQnIDogZmFsc2UsXG4gICAgc291cmNlbWFwOiAhIXByb2Nlc3MuZW52LlRBVVJJX0RFQlVHLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULFNBQVMsb0JBQW9CO0FBQ3pWLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7QUFIb0wsSUFBTSwyQ0FBMkM7QUFLdFAsSUFBTSxhQUFhLGNBQWMsd0NBQWU7QUFDaEQsSUFBTSxZQUFZLEtBQUssUUFBUSxVQUFVO0FBR3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixhQUFhO0FBQUEsRUFDYixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCw0QkFBNEIsS0FBSyxRQUFRLFdBQVcsOEJBQThCO0FBQUEsTUFDbEYsaUNBQWlDLEtBQUssUUFBUSxXQUFXLG1DQUFtQztBQUFBLE1BQzVGLG1DQUFtQyxLQUFLLFFBQVEsV0FBVyxxQ0FBcUM7QUFBQSxNQUNoRyxpQ0FBaUMsS0FBSyxRQUFRLFdBQVcsbUNBQW1DO0FBQUEsTUFDNUYsa0NBQWtDLEtBQUssUUFBUSxXQUFXLG9DQUFvQztBQUFBLE1BQzlGLGlDQUFpQyxLQUFLLFFBQVEsV0FBVyxtQ0FBbUM7QUFBQSxNQUM1RixrQ0FBa0MsS0FBSyxRQUFRLFdBQVcsb0NBQW9DO0FBQUEsTUFDOUYscUNBQXFDLEtBQUssUUFBUSxXQUFXLHVDQUF1QztBQUFBLE1BQ3BHLCtCQUErQixLQUFLLFFBQVEsV0FBVyxpQ0FBaUM7QUFBQSxNQUN4RiwrQkFBK0IsS0FBSyxRQUFRLFdBQVcsaUNBQWlDO0FBQUEsTUFDeEYsaUNBQWlDLEtBQUssUUFBUSxXQUFXLG1DQUFtQztBQUFBLE1BQzVGLGdDQUFnQyxLQUFLLFFBQVEsV0FBVyxrQ0FBa0M7QUFBQSxNQUMxRix1QkFBdUIsS0FBSyxRQUFRLFdBQVcseUJBQXlCO0FBQUEsTUFDeEUsOEJBQThCLEtBQUssUUFBUSxXQUFXLGdDQUFnQztBQUFBLE1BQ3RGLGdDQUFnQyxLQUFLLFFBQVEsV0FBVyxrQ0FBa0M7QUFBQSxNQUMxRiw2QkFBNkIsS0FBSyxRQUFRLFdBQVcsK0JBQStCO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVMsUUFBUTtBQUFBLEVBQzdCLE9BQU87QUFBQSxJQUNMLFFBQVEsUUFBUSxJQUFJLG1CQUFtQixZQUFZLGNBQWM7QUFBQSxJQUNqRSxRQUFRLENBQUMsUUFBUSxJQUFJLGNBQWMsWUFBWTtBQUFBLElBQy9DLFdBQVcsQ0FBQyxDQUFDLFFBQVEsSUFBSTtBQUFBLEVBQzNCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
