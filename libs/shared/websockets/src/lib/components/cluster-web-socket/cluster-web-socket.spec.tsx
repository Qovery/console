import { render } from '__tests__/utils/setup-jest'
import { ClusterWebSocket } from './cluster-web-socket'

describe('ClusterWebSocket', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterWebSocket url={'ws://test.com'} />)
    expect(baseElement).toBeTruthy()
  })
})
