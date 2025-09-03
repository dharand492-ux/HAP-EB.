import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import html from '@rollup/plugin-html';

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    nodeResolve(),
    html({
      template: ({ attributes, files, meta, publicPath, title }) => {
        return `
<!DOCTYPE html>
<html${attributes.html}>
<head>
  ${meta}
  <title>${title}</title>
  ${files.css.map(({ fileName }) => 
    `<link href="${publicPath}${fileName}" rel="stylesheet">`
  ).join('\n  ')}
</head>
<body>
  <div id="root"></div>
  ${files.js.map(({ fileName }) => 
    `<script type="module" src="${publicPath}${fileName}"></script>`
  ).join('\n  ')}
</body>
</html>`;
      }
    }),
    terser()
  ]
};
