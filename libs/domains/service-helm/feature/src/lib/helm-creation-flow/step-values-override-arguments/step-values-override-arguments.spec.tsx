import { useForm } from 'react-hook-form'
import { type HelmGeneralData } from '@qovery/domains/services/feature'
import { renderHook, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type HelmValuesArgumentsData } from '../../values-override-arguments-setting/values-override-arguments-setting'
import { type HelmValuesFileData } from '../../values-override-files-setting/values-override-files-setting'
import { HelmCreateContext } from '../helm-creation-flow'
import { HelmStepValuesOverrideArguments } from './step-values-override-arguments'

jest.mock('@qovery/domains/variables/feature', () => ({
  CodeEditorVariable: ({ value, onChange }: { value?: string; onChange?: (value?: string) => void }) => (
    <textarea data-testid="code-editor-variable" value={value} onChange={(event) => onChange?.(event.target.value)} />
  ),
  FieldVariableSuggestion: ({ inputProps }: { inputProps: Record<string, unknown> }) => {
    const { error: _error, ...rest } = inputProps
    return <input data-testid="field-variable-suggestion" {...rest} />
  },
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => jest.fn(),
  useSearch: () => ({}),
}))

describe('HelmStepValuesOverrideArguments', () => {
  it('renders the terminal provisional step with a disabled continue button', () => {
    const { result: generalForm } = renderHook(() =>
      useForm<HelmGeneralData>({
        mode: 'onChange',
        defaultValues: {
          name: 'my-helm-app',
          source_provider: 'GIT',
          provider: 'GITHUB',
          git_repository: {
            id: '1',
            name: 'Qovery/github',
            url: 'https://github.com/Qovery/github',
            default_branch: 'main',
            is_private: false,
          },
          branch: 'main',
          root_path: '/',
          arguments: '--wait',
          timeout_sec: 600,
        },
      })
    )

    const { result: valuesOverrideFileForm } = renderHook(() =>
      useForm<HelmValuesFileData>({
        mode: 'onChange',
        defaultValues: {
          type: 'NONE',
        },
      })
    )

    const { result: valuesOverrideArgumentsForm } = renderHook(() =>
      useForm<HelmValuesArgumentsData>({
        mode: 'onChange',
        defaultValues: {
          arguments: [],
        },
      })
    )

    renderWithProviders(
      <HelmCreateContext.Provider
        value={{
          currentStep: 3,
          setCurrentStep: jest.fn(),
          creationFlowUrl: '/create/helm',
          generalForm: generalForm.current,
          valuesOverrideFileForm: valuesOverrideFileForm.current,
          valuesOverrideArgumentsForm: valuesOverrideArgumentsForm.current,
        }}
      >
        <HelmStepValuesOverrideArguments />
      </HelmCreateContext.Provider>
    )

    expect(screen.getByText('Next steps are not migrated yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})
