import { renderHook } from '@testing-library/react-hooks'
import { useOrganization } from './organization-provider'

describe('Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useOrganization())

    expect(result).toBeTruthy()
  })
})
