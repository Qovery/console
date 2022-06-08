import { render } from '__tests__/utils/setup-jest'

import WebsocketContainer from './websocket-container'

describe('WebsocketContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebsocketContainer />)
    expect(baseElement).toBeTruthy()
  })
})
