import { renderHook } from '@testing-library/react-hooks'
import { useOrganizations } from './provider'

describe('Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useOrganizations())

    expect(result).toBeTruthy()
  })
})
