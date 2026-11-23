import { canManagePolicyTokens } from './can-manage-policy-tokens'

const organizationId = 'organization-1'
const can = (roles: string[], isQoveryAdminUser = false) =>
  canManagePolicyTokens({ roles, organizationId, isQoveryAdminUser })

describe('canManagePolicyTokens', () => {
  it('allows owners, admins and DevOps members of the organization', () => {
    ;['owner', 'admin', 'devops'].forEach((role) => expect(can([`organization:${organizationId}:${role}`])).toBe(true))
  })

  it('refuses Billing, Viewer and custom roles', () => {
    ;['billing', 'viewer', '0b5e2c4a-6a51-4d1e-9a0f-1f3c2a7b9e10'].forEach((role) =>
      expect(can([`organization:${organizationId}:${role}`])).toBe(false)
    )
  })

  it('refuses a DevOps member of another organization, even with a lookalike id', () => {
    expect(can(['organization:other:devops', `organization:${organizationId}-x:devops`])).toBe(false)
  })

  it('allows Qovery staff', () => {
    expect(can([], true)).toBe(true)
  })
})
