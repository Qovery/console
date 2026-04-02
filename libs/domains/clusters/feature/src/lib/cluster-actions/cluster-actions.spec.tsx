import {
  ClusterDeploymentStatusEnum,
  ClusterStateEnum,
  type ClusterStatus,
  GitProviderEnum,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterActions } from './cluster-actions'

const mockCluster = clusterFactoryMock(1)[0]
const mockClusterStatus: ClusterStatus = {
  cluster_id: mockCluster.id,
  status: ClusterStateEnum.DEPLOYED,
  is_deployed: true,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({
    buildLocation: () => ({ href: '/' }),
  }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

describe('ClusterActions', () => {
  it('should match manage deployment snapshot', async () => {
    mockCluster.deployment_status = ClusterDeploymentStatusEnum.UP_TO_DATE
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActions cluster={mockCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    mockCluster.deployment_status = ClusterDeploymentStatusEnum.UP_TO_DATE
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActions cluster={mockCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match outdated snapshot', async () => {
    mockCluster.deployment_status = ClusterDeploymentStatusEnum.OUT_OF_DATE
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActions cluster={mockCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should show "Update another version" for EKS Anywhere clusters with git source', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
      infrastructure_charts_parameters: {
        eks_anywhere_parameters: {
          git_repository: {
            url: 'https://github.com/Qovery/k8s-event-logger.git',
            branch: 'main',
            commit_id: '1234567',
            git_token_id: 'token-id',
            provider: GitProviderEnum.GITHUB,
          },
          yaml_file_path: '/cluster.yaml',
        },
      },
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(screen.getByText('Update another version')).toBeInTheDocument()
  })

  it('should not show "Update another version" without EKS Anywhere git source', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(screen.queryByText('Update another version')).not.toBeInTheDocument()
  })
})
