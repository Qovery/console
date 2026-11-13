import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type FormEvent } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ValuesOverrideArgumentsSetting,
  type ValuesOverrideArgumentsSettingBaseProps,
} from './values-override-arguments-setting'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

const mockFieldVariableSuggestionProps = jest.fn()
const mockCodeEditorVariableProps = jest.fn()

jest.mock('@qovery/domains/variables/feature', () => ({
  CodeEditorVariable: (props: { value?: string; onChange?: (value?: string) => void }) => {
    mockCodeEditorVariableProps(props)
    const { value, onChange } = props
    return (
      <textarea data-testid="code-editor-variable" value={value} onChange={(event) => onChange?.(event.target.value)} />
    )
  },
  FieldVariableSuggestion: (props: { inputProps: Record<string, unknown> }) => {
    mockFieldVariableSuggestionProps(props)
    const { error: _error, ...rest } = props.inputProps
    return <input data-testid="field-variable-suggestion" {...rest} />
  },
}))

describe('ValuesOverrideArgumentsSetting', () => {
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)

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

  it('does not submit the parent form when opening default values in settings mode', async () => {
    const onParentSubmit = jest.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <form onSubmit={onParentSubmit}>
          <ValuesOverrideArgumentsSetting {...props} isSetting />
        </form>,
        {
          defaultValues: {
            arguments: [
              {
                key: 'test',
                type: '--set',
                value: 'test',
              },
            ],
          },
        }
      )
    )

    await userEvent.click(screen.getByRole('button', { name: /See default values.yaml/i }))

    expect(openSpy).toHaveBeenCalled()
    expect(onParentSubmit).not.toHaveBeenCalled()
  })

  it('passes the service id and HELM scope to the variable pickers so service-level variables are listed', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideArgumentsSetting {...props} />, {
        defaultValues: {
          arguments: [
            { key: 'test', type: '--set', value: 'test' },
            { key: 'test2', type: '--set-json', value: 'test', json: '{"test": "test"}' },
          ],
        },
      })
    )

    expect(mockFieldVariableSuggestionProps).toHaveBeenCalledWith(
      expect.objectContaining({ environmentId: 'env-1', serviceId: 'service-1', scope: 'HELM' })
    )
    expect(mockCodeEditorVariableProps).toHaveBeenCalledWith(
      expect.objectContaining({ environmentId: 'env-1', serviceId: 'service-1', scope: 'HELM' })
    )
  })
})
