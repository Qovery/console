import { StateEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterButtonsActions, type ClusterButtonsActionsProps } from './cluster-buttons-actions'

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
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        status: StateEnum.DEPLOYED,
      },
    }
    const { userEvent } = renderWithProviders(<ClusterButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Update')
    screen.getByText('Stop')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifier')
    screen.getByText('Delete cluster')
  })

  it('should render actions for STOPPED status', async () => {
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        is_deployed: true,
        status: StateEnum.STOPPED,
      },
    }

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
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        is_deployed: false,
        status: StateEnum.READY,
      },
    }

    const { userEvent } = renderWithProviders(<ClusterButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Install')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifier')
    screen.getByText('Delete cluster')
  })
})
