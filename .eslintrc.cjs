module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.ssr', '.eslintrc.cjs'],
  globals: { __BUILD_YEAR__: 'readonly' },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  overrides: [{ files: ['scripts/**', '*.config.js'], env: { node: true } }],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    // fetchpriority: lowercase HTML attribute (React 18 does not know fetchPriority). toolname/tooldescription: WebMCP form annotations.
    'react/no-unknown-property': ['error', { ignore: ['fetchpriority', 'toolname', 'tooldescription'] }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
      
    ],
  },
}
