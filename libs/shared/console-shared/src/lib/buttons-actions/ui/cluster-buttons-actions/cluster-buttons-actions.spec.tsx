import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { StateEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterButtonsActions, ClusterButtonsActionsProps } from './cluster-buttons-actions'

const mockCluster = clusterFactoryMock(1)[0]
const props: ClusterButtonsActionsProps = {
  cluster: mockCluster,
}

describe('ClusterButtonsActionsFeature', () => {
  beforeEach(() => {
    mockCluster.status = StateEnum.STOPPED
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ClusterButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for RUNNING status', async () => {
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        status: StateEnum.RUNNING,
      },
    }
    const { baseElement } = render(<ClusterButtonsActions {...props} />)

    getByText(baseElement, 'Update')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Copy identifier')
    getByText(baseElement, 'Delete cluster')
  })

  it('should render actions for STOPPED status', async () => {
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        is_deployed: true,
        status: StateEnum.STOPPED,
      },
    }

    const { baseElement } = render(<ClusterButtonsActions {...props} />)

    getByText(baseElement, 'Deploy')
    getByText(baseElement, 'Copy identifier')
    getByText(baseElement, 'Delete cluster')
  })

  it('should render actions for READY status', async () => {
    props.cluster.extendedStatus = {
      loadingStatus: 'loaded',
      status: {
        is_deployed: false,
        status: StateEnum.READY,
      },
    }

    const { baseElement } = render(<ClusterButtonsActions {...props} />)

    getByText(baseElement, 'Install')
    getByText(baseElement, 'Copy identifier')
    getByText(baseElement, 'Delete cluster')
  })
})
