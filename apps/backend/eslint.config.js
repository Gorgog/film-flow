import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
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
      prettier,
    },

    rules: {
      'prettier/prettier': 'error', // Prettier как ошибка ESLint
      'no-console': 'warn', // предупреждает о console.log (можно убрать)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off', // не обязательно возвращать тип
      '@typescript-eslint/no-explicit-any': 'warn', // any — ок, но предупреждает
      eqeqeq: ['error', 'always'], // === вместо ==
    },

    languageOptions: {
      parserOptions: {
        project: true, // если используешь tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { prettier },
    rules: {
      /* ... */
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Отключаем форматирующие правила ESLint (Prettier берёт на себя)
  prettierConfig
);
