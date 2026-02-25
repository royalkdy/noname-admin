// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },

  // 기본 JS 규칙
  eslint.configs.recommended,

  // TypeScript 기본 규칙
  ...tseslint.configs.recommended,

  // Type-aware 규칙 (중요)
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier 통합
  prettierRecommended,

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json', // ✅ 안정 모드
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  {
    rules: {
      /* ------------------------
         타입 안정성 핵심
      ------------------------- */
      // “await 안 한 Promise”를 막는 룰
      '@typescript-eslint/no-floating-promises': 'error',
      // Promise를 잘못된 곳에 쓰는 것 막는 룰
      '@typescript-eslint/no-misused-promises': 'error',

      // ESLint가 Prisma의 제네릭 타입을 제대로 해석 못해서 생기는 경고
      // Prisma + typescript-eslint 조합에서 자주 나오는 가짜 경고
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      /* ------------------------
         실무 편의
      ------------------------- */

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /* ------------------------
         코드 품질
      ------------------------- */

      'no-console': 'off', // NestJS는 logger 사용
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];
