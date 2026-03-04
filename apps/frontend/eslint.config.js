import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import ts from 'typescript-eslint';

export default ts.config(
  {
    ignores: ['eslint.config.js', 'node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.stylistic,

  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      'react/prop-types': 'off', // не нужно с TS
      'prettier/prettier': 'error', // Prettier как ошибка ESLint
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      react: { version: 'detect' },
    },
  },

  // Отключаем форматирующие правила ESLint, чтобы Prettier правил
  prettierConfig
);
