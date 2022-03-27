import { renderHook } from '@testing-library/react-hooks'
import { useProjects } from './projects-provider'

describe('Projects Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useProjects())

    expect(result).toBeTruthy()
  })
})
