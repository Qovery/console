import { StateEnum } from 'qovery-typescript-axios'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterButtonsActions, type ClusterButtonsActionsProps } from './cluster-buttons-actions'

const useClusterStatusSpy = jest.spyOn(clustersDomain, 'useClusterStatus') as jest.Mock

const mockCluster = clusterFactoryMock(1)[0]
const props: ClusterButtonsActionsProps = {
  cluster: mockCluster,
}

describe('ClusterButtonsActionsFeature', () => {
  beforeEach(() => {
    mockCluster.status = StateEnum.STOPPED
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for DEPLOYED status', async () => {
    useClusterStatusSpy.mockReturnValue({
      data: {
        status: StateEnum.DEPLOYED,
      },
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(<ClusterButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Update')
    screen.getByText('Stop')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifier')
    screen.getByText('Get Kubeconfig')
    screen.getByText('Delete cluster')
  })

  it('should render actions for STOPPED status', async () => {
    useClusterStatusSpy.mockReturnValue({
      data: {
        is_deployed: true,
        status: StateEnum.STOPPED,
      },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<ClusterButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Deploy')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifier')
    screen.getByText('Delete cluster')
  })

  it('should render actions for READY status', async () => {
    useClusterStatusSpy.mockReturnValue({
      data: {
        is_deployed: false,
        status: StateEnum.READY,
      },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<ClusterButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Install')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifier')
    screen.getByText('Get Kubeconfig')
    screen.getByText('Delete cluster')
  })
})
