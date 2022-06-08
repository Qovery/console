import { render } from '__tests__/utils/setup-jest'
import { ClusterWebSocket } from '@console/shared/websockets'

describe('ClusterWebSocket', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterWebSocket url="url" />)
    expect(baseElement).toBeTruthy()
  })
})
