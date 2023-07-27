import { renderHook } from '@testing-library/react'
import { Wrapper } from '__tests__/utils/providers'
import useRunningStatusWebsocket from './use-running-status-websocket'

describe('Running Status Websocket Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(
      () =>
        useRunningStatusWebsocket({
          getAccessTokenSilently: jest.fn(),
        }),
      {
        wrapper: Wrapper,
      }
    )

    expect(result).toBeTruthy()
  })
})
