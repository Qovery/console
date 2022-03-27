import { renderHook } from '@testing-library/react-hooks'
import { useProjects } from './provider'

describe('Projects Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useProjects())

    expect(result).toBeTruthy()
  })
})
