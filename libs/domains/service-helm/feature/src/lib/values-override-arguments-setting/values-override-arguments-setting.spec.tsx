import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import {
  ValuesOverrideArgumentsSetting,
  type ValuesOverrideArgumentsSettingBaseProps,
} from './values-override-arguments-setting'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    environmentId: 'env-1',
  }),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  CodeEditorVariable: ({ value, onChange }: { value?: string; onChange?: (value?: string) => void }) => (
    <textarea data-testid="code-editor-variable" value={value} onChange={(event) => onChange?.(event.target.value)} />
  ),
  FieldVariableSuggestion: ({ inputProps }: { inputProps: Record<string, unknown> }) => {
    const { error: _error, ...rest } = inputProps
    return <input data-testid="field-variable-suggestion" {...rest} />
  },
}))

describe('ValuesOverrideArgumentsSetting', () => {
  const props: ValuesOverrideArgumentsSettingBaseProps = {
    onSubmit: jest.fn(),
    source: {
      git_repository: {
        url: 'github.com',
        branch: 'main',
        root_path: 'root',
        git_token_id: 'token',
      },
    },
    methods: {
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      getValues: jest.fn(),
      setValue: jest.fn(),
      register: jest.fn(),
      unregister: jest.fn(),
      formState: {
        errors: {},
        isDirty: false,
        isValid: false,
        isSubmitting: false,
        submitCount: 0,
      },
    },
  }

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideArgumentsSetting {...props} />, {
        defaultValues: {
          arguments: [
            {
              key: 'test',
              type: '--set',
              value: 'test',
            },
            {
              key: 'test2',
              type: '--set-json',
              value: 'test',
              json: '{"test": "test"}',
            },
            {
              key: 'test3',
              type: '--set-string',
              value: 'test',
              json: 'test',
            },
          ],
        },
      })
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot for the v5-compatible base component', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideArgumentsSetting {...props} />, {
        defaultValues: {
          arguments: [
            {
              key: 'test',
              type: '--set',
              value: 'test',
            },
          ],
        },
      })
    )

    expect(baseElement).toMatchSnapshot()
  })
})
