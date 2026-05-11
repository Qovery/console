import { useForm } from 'react-hook-form'
import { type HelmGeneralData } from '@qovery/domains/services/feature'
import { renderHook, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type HelmValuesArgumentsData } from '../../values-override-arguments-setting/values-override-arguments-setting'
import { type HelmValuesFileData } from '../../values-override-files-setting/values-override-files-setting'
import { HelmCreateContext } from '../helm-creation-flow'
import { HelmStepValuesOverrideFile } from './step-values-override-files'

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: () => <div data-testid="git-branch-settings" />,
  GitProviderSetting: () => <div data-testid="git-provider-setting" />,
  GitPublicRepositorySettings: () => <div data-testid="git-public-repository-settings" />,
  GitRepositorySetting: () => <div data-testid="git-repository-setting" />,
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

describe('HelmStepValuesOverrideFile', () => {
  it('renders the intermediate step and allows continuing when no file override is configured', () => {
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
          currentStep: 2,
          setCurrentStep: jest.fn(),
          creationFlowUrl: '/create/helm',
          generalForm: generalForm.current,
          valuesOverrideFileForm: valuesOverrideFileForm.current,
          valuesOverrideArgumentsForm: valuesOverrideArgumentsForm.current,
        }}
      >
        <HelmStepValuesOverrideFile />
      </HelmCreateContext.Provider>
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
})
