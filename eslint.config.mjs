import nx from '@nx/eslint-plugin'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import jest from 'eslint-plugin-jest'
import jestDom from 'eslint-plugin-jest-dom'
import react from 'eslint-plugin-react'
import storybook from 'eslint-plugin-storybook'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// eslint-plugin-react's `version: 'detect'` relies on `context.getFilename()`, which was removed in ESLint 10.
const reactVersion = require('react/package.json').version

export default [
  {
    ignores: ['**/routeTree.gen.ts', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/.storybook/main.@(js|cjs|mjs|ts)'],
    rules: {
      // Dependencies are declared in the workspace root package.json, not in each project.
      'storybook/no-uninstalled-addons': ['error', { packageJsonLocation: require.resolve('./package.json') }],
    },
  },
  ...nx.configs['flat/base'],
  {
    settings: {
      react: { version: reactVersion },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['store'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
          allowObjectTypes: 'always',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
    },
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@tanstack/query': tanstackQuery,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['default'],
              message: 'React should be destructured.',
              allowTypeImports: false,
            },
            {
              name: '@testing-library/react',
              importNames: ['render', 'screen'],
              message: 'Use `renderWithProviders`, `render` and `screen` from the `@qovery/shared/util-tests` package.',
              allowTypeImports: false,
            },
            {
              name: '@testing-library/user-event',
              importNames: ['default'],
              message:
                'Destructure `userEvent` exposed by the `renderWithProviders` function from the `@qovery/shared/util-tests` package.',
            },
            {
              name: '@uidotdev/usehooks',
              message:
                'Use imports from `@qovery/shared/util-hooks` instead of direct imports from `@uidotdev/usehooks`.',
            },
            {
              name: 'ansi-to-react',
              importNames: ['default'],
              message: 'Use `Ansi` from the `@qovery/shared/ui` package.',
              allowTypeImports: false,
            },
            {
              name: 'tailwind-merge',
              importNames: ['twMerge'],
              message: 'Use `twMerge` from the `@qovery/shared/util-js` package.',
              allowTypeImports: false,
            },
            {
              name: 'cronstrue',
              importNames: ['default'],
              message: 'Use `formatCronExpression` from the `@qovery/shared/util-js` package.',
              allowTypeImports: false,
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '__tests__/utils/setup-jest',
              importNames: ['render', 'screen'],
              message: 'Use `renderWithProviders`, `render` and `screen` from the `@qovery/shared/util-tests` package.',
            },
            {
              name: '@testing-library/react',
              importNames: ['fireEvent'],
              message:
                'Prefer `userEvent` exposed by the `renderWithProviders` function from the `@qovery/shared/util-tests` package.',
            },
            {
              name: '__tests__/utils/setup-jest',
              importNames: ['fireEvent'],
              message:
                'Prefer `userEvent` exposed by the `renderWithProviders` function from the `@qovery/shared/util-tests` package.',
            },
          ],
        },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/stable-query-client': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    ...jest.configs['flat/recommended'],
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    ...jestDom.configs['flat/recommended'],
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react,
    },
    rules: {
      'react/jsx-curly-brace-presence': 'error',
      'react/jsx-key': 'error',
    },
  },
]
