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
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
let mockClusterStatus: ClusterStatus = {
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

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

describe('ClusterActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCluster.deployment_status = ClusterDeploymentStatusEnum.UP_TO_DATE
    mockClusterStatus = {
      cluster_id: mockCluster.id,
      status: ClusterStateEnum.DEPLOYED,
      is_deployed: true,
    }
  })

  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
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
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
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
      <ClusterActions cluster={eksAnywhereCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(screen.getByText('Update another version')).toBeInTheDocument()
  })

  it('should show "Update" instead of "Install" for non-deployed EKS Anywhere clusters', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
    }
    const notDeployedClusterStatus: ClusterStatus = {
      cluster_id: eksAnywhereCluster.id,
      status: ClusterStateEnum.READY,
      is_deployed: false,
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} clusterStatus={notDeployedClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))

    expect(screen.getByRole('menuitem', { name: 'Update' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Install' })).not.toBeInTheDocument()
  })

  it('should open update modal when selecting "Update" on non-deployed EKS Anywhere cluster', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
    }
    const notDeployedClusterStatus: ClusterStatus = {
      cluster_id: eksAnywhereCluster.id,
      status: ClusterStateEnum.READY,
      is_deployed: false,
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} clusterStatus={notDeployedClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Update' }))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.anything(),
      })
    )
  })

  it('should not show "Update another version" without EKS Anywhere git source', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(screen.queryByText('Update another version')).not.toBeInTheDocument()
  })

  it('should show "Copy cluster JWT" in other actions for EKS Anywhere clusters', async () => {
    const eksAnywhereCluster = {
      ...clusterFactoryMock(1)[0],
      deployment_status: ClusterDeploymentStatusEnum.UP_TO_DATE,
      kubernetes: KubernetesEnum.PARTIALLY_MANAGED,
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={eksAnywhereCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(screen.getByText('Copy cluster JWT')).toBeInTheDocument()
  })

  it('should not show "Copy cluster JWT" for non EKS Anywhere clusters', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(screen.queryByText('Copy cluster JWT')).not.toBeInTheDocument()
  })

  it('should keep a confirmation modal for stop', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /stop/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm stop',
        name: mockCluster.name,
      })
    )
  })

  it('should keep a confirmation modal for kubernetes upgrades', async () => {
    mockClusterStatus = {
      ...mockClusterStatus,
      next_k8s_available_version: '1.29',
    }

    const { userEvent } = renderWithProviders(
      <ClusterActions cluster={mockCluster} clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /upgrade k8s to 1.29/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm upgrade',
        name: mockCluster.name,
      })
    )
  })
})
