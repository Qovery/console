import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepEks, { type StepEksProps } from './step-eks'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockSetResourcesData = jest.fn()
const mockNavigate = jest.fn()

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 3,
  setCurrentStep: mockSetCurrentStep,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'eu-west-3',
    installation_type: 'PARTIALLY_MANAGED',
  },
  setGeneralData: jest.fn(),
  resourcesData: {
    ...defaultResourcesData,
    infrastructure_charts_parameters: {
      ...defaultResourcesData.infrastructure_charts_parameters,
      eks_anywhere_parameters: {
        git_repository: {
          url: 'https://github.com/qovery/eks-anywhere.git',
          branch: 'main',
          git_token_id: 'token-id',
          provider: 'GITHUB',
        },
        yaml_file_path: 'clusters/prod/cluster.yaml',
      },
    },
  },
  setResourcesData: mockSetResourcesData,
  featuresData: { vpc_mode: undefined, features: {} },
  setFeaturesData: jest.fn(),
  kubeconfigData: undefined,
  setKubeconfigData: jest.fn(),
  creationFlowUrl: '/organization/org-123/cluster/create/aws-eks-anywhere',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

function MockGitRepositorySettings() {
  const { register } = useFormContext()

  return (
    <div data-testid="git-repository-settings">
      <input {...register('git_repository.url')} />
      <input {...register('branch')} />
      <input {...register('root_path')} />
      <input {...register('provider')} />
      <input {...register('git_token_id')} />
    </div>
  )
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  GitRepositorySettings: () => <MockGitRepositorySettings />,
}))

jest.mock('../../cluster-eks-settings/cluster-eks-settings', () => ({
  ClusterEksSettings: ({ gitSettings }: { gitSettings: ReactNode }) => (
    <div data-testid="cluster-eks-settings">{gitSettings}</div>
  ),
}))

const defaultProps: StepEksProps = {
  organizationId: 'org-123',
  onSubmit: mockOnSubmit,
}

describe('StepEks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render eks step', async () => {
    renderWithProviders(<StepEks {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('EKS configuration')).toBeInTheDocument()
      expect(screen.getByTestId('cluster-eks-settings')).toBeInTheDocument()
      expect(screen.getByTestId('button-submit')).toBeInTheDocument()
    })
  })

  it('should set current step on mount', async () => {
    renderWithProviders(<StepEks {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalledWith(3)
    })
  })

  it('should navigate back to kubeconfig step', async () => {
    const { userEvent } = renderWithProviders(<StepEks {...defaultProps} />, { wrapper: Wrapper })

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/org-123/cluster/create/aws-eks-anywhere/kubeconfig',
    })
  })

  it('should persist eks anywhere configuration on submit', async () => {
    const { container } = renderWithProviders(<StepEks {...defaultProps} />, { wrapper: Wrapper })
    const form = container.querySelector('form')

    expect(form).not.toBeNull()

    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(mockSetResourcesData).toHaveBeenCalledWith({
        ...defaultResourcesData,
        infrastructure_charts_parameters: {
          ...defaultResourcesData.infrastructure_charts_parameters,
          eks_anywhere_parameters: {
            git_repository: {
              url: 'https://github.com/qovery/eks-anywhere.git',
              branch: 'main',
              git_token_id: 'token-id',
              provider: 'GITHUB',
            },
            yaml_file_path: 'clusters/prod/cluster.yaml',
          },
        },
      })
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
