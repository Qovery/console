import { renderHook } from '@testing-library/react-hooks'
import { useInviteMember } from '@qovery/shared/utils'

describe('useInviteMember Hook', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useInviteMember())

    expect(result).toBeTruthy()
  })
})
