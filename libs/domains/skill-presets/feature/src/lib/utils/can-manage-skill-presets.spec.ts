import { canManageSkillPresets } from './can-manage-skill-presets'

const organizationId = 'organization-1'
const can = (roles: string[], isQoveryAdminUser = false) =>
  canManageSkillPresets({ roles, organizationId, isQoveryAdminUser })

describe('canManageSkillPresets', () => {
  it('allows owners and admins of the organization', () => {
    expect(can([`organization:${organizationId}:owner`])).toBe(true)
    expect(can([`organization:${organizationId}:admin`])).toBe(true)
  })

  it('refuses DevOps, Billing, Viewer and custom roles', () => {
    ;['devops', 'billing', 'viewer', '0b5e2c4a-6a51-4d1e-9a0f-1f3c2a7b9e10'].forEach((role) =>
      expect(can([`organization:${organizationId}:${role}`])).toBe(false)
    )
  })

  it('refuses an admin of another organization, even with a lookalike id', () => {
    expect(can(['organization:other:admin', `organization:${organizationId}-x:admin`])).toBe(false)
  })

  it('allows Qovery staff', () => {
    expect(can([], true)).toBe(true)
  })
})
