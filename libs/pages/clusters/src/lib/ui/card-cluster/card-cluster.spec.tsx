import { act, render } from '__tests__/utils/setup-jest'
import { StateEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { getStatusClusterMessage } from '@qovery/shared/utils'
import CardCluster, { CardClusterProps, getColorForStatus } from './card-cluster'

describe('CardCluster', () => {
  let props: CardClusterProps

  beforeEach(() => {
    props = {
      cluster: clusterFactoryMock(1)[0],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have tags', () => {
    props.cluster.is_default = true
    props.cluster.production = true

    const { getByTestId } = render(<CardCluster {...props} />)

    expect(getByTestId('tag-prod')).toBeInTheDocument()
    expect(getByTestId('tag-default')).toBeInTheDocument()
    expect(getByTestId('tag-region').textContent).toBe(props.cluster.region)
    expect(getByTestId('tag-version').textContent).toBe(props.cluster.version)
    expect(getByTestId('tag-instance').textContent).toBe(props.cluster.instance_type)
  })

  it('should have a name', () => {
    const { baseElement } = render(<CardCluster {...props} />)

    expect(baseElement.querySelector('h2')?.textContent).toBe(props.cluster.name)
  })

  it('should have a status message', async () => {
    if (props.cluster.extendedStatus?.status?.status) {
      props.cluster.extendedStatus.status.status = StateEnum.READY
    }
    const status = props.cluster.extendedStatus?.status?.status

    const { getByTestId } = render(<CardCluster {...props} />)

    await act(() => {
      expect(getByTestId('status-message').textContent).toContain(getStatusClusterMessage(status))
    })
  })

  it('should have a function to display color by status', () => {
    expect(getColorForStatus(StateEnum.DELETING)).toBe('text-progressing-500')
    expect(getColorForStatus(StateEnum.STOP_ERROR)).toBe('text-error-500')
    expect(getColorForStatus(StateEnum.READY)).toBe('text-brand-500')
  })
})
