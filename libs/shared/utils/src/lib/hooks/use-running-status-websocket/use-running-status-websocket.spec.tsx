import { renderHook } from '@testing-library/react-hooks'
import useRunningStatusWebsocket from './use-running-status-websocket'

describe('Running Status Websocket Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useRunningStatusWebsocket())

    expect(result).toBeTruthy()
  })
})
