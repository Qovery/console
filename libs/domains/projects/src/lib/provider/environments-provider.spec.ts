import { renderHook } from '@testing-library/react-hooks'
import { useEnviroments } from './environments-provider'

describe('Environments Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useEnviroments())

    expect(result).toBeTruthy()
  })
})
