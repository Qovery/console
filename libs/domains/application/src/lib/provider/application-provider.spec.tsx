import { renderHook } from '@testing-library/react-hooks'
import { useApplication } from './application-provider'

describe('Application Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useApplication())

    expect(result).toBeTruthy()
  })
})
