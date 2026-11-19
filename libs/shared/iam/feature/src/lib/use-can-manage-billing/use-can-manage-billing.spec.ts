import { renderHook } from '@qovery/shared/util-tests'
import * as useUserRoleImport from '../use-user-role/use-user-role'
import { canManageBilling, useCanManageBilling } from './use-can-manage-billing'

const organizationId = '1f2a3b4c-0000-4000-8000-000000000001'
const otherOrganizationId = '1f2a3b4c-0000-4000-8000-000000000002'

describe('canManageBilling', () => {
  it.each(['owner', 'admin', 'billing'])('returns true for the %s role of the organization', (role) => {
    expect(canManageBilling({ roles: [`organization:${organizationId}:${role}`], organizationId })).toBe(true)
  })

  it.each(['devops', 'viewer', '6f1d2c3b-aaaa-4bbb-8ccc-123456789abc'])(
    'returns false for the %s role of the organization',
    (role) => {
      expect(canManageBilling({ roles: [`organization:${organizationId}:${role}`], organizationId })).toBe(false)
    }
  )

  it('returns false for a billing role in another organization', () => {
    expect(canManageBilling({ roles: [`organization:${otherOrganizationId}:billing`], organizationId })).toBe(false)
  })

  it('returns false for role names that only start with a billing role', () => {
    expect(
      canManageBilling({
        roles: [`organization:${organizationId}:billing-team`, `organization:${organizationId}:administrators`],
        organizationId,
      })
    ).toBe(false)
  })

  it('returns false for organization id prefix tricks', () => {
    expect(
      canManageBilling({
        roles: [
          `organization:${organizationId}x:admin`,
          `xorganization:${organizationId}:admin`,
          `organization:${organizationId}:admin:extra`,
          `organization::admin`,
        ],
        organizationId,
      })
    ).toBe(false)
  })

  it('returns false without an organization id', () => {
    expect(canManageBilling({ roles: ['organization::admin'], organizationId: '' })).toBe(false)
  })

  it('returns false when roles are missing', () => {
    expect(canManageBilling({ roles: undefined, organizationId })).toBe(false)
  })

  it('returns true for a Qovery admin', () => {
    expect(canManageBilling({ roles: ['admin'], organizationId, isQoveryAdminUser: true })).toBe(true)
  })
})

describe('useCanManageBilling', () => {
  it('reads roles from the user token', () => {
    jest.spyOn(useUserRoleImport, 'useUserRole').mockReturnValue({
      roles: [`organization:${organizationId}:billing`],
      loading: false,
      isQoveryAdminUser: false,
    })

    const { result } = renderHook(() => useCanManageBilling(organizationId))

    expect(result.current).toEqual({ canManageBilling: true, loading: false })
  })

  it('returns false while roles are loading', () => {
    jest.spyOn(useUserRoleImport, 'useUserRole').mockReturnValue({
      roles: [],
      loading: true,
      isQoveryAdminUser: false,
    })

    const { result } = renderHook(() => useCanManageBilling(organizationId))

    expect(result.current).toEqual({ canManageBilling: false, loading: true })
  })
})
