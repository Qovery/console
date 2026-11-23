import { assignmentConflicts, effectiveRoleId, isTemplate, membersReceiving, resolvePresetFor } from './resolve-preset'

const preset = (
  id: string,
  assigned: Partial<{ organization_default: boolean; role_ids: string[]; user_ids: string[] }>
) => ({
  id,
  name: id,
  assigned_to: { organization_default: false, role_ids: [], user_ids: [], ...assigned },
})

const presets = [
  preset('default', { organization_default: true }),
  preset('devops', { role_ids: ['role-devops'] }),
  preset('jamie', { user_ids: ['user-jamie'] }),
]

describe('resolvePresetFor', () => {
  it('prefers the member, then the role, then the organization default', () => {
    expect(resolvePresetFor(presets, { userId: 'user-jamie', roleId: 'role-devops' })).toEqual({
      source: 'USER',
      preset: presets[2],
    })
    expect(resolvePresetFor(presets, { userId: 'user-priya', roleId: 'role-devops' })).toEqual({
      source: 'ROLE',
      preset: presets[1],
    })
    expect(resolvePresetFor(presets, { userId: 'user-sam', roleId: 'role-admin' })).toEqual({
      source: 'ORGANIZATION',
      preset: presets[0],
    })
    expect(resolvePresetFor([], { userId: 'user-sam' })).toEqual({ source: 'QOVERY_DEFAULT', preset: null })
  })

  it('counts who a draft would reach, after more specific presets', () => {
    const members = [
      { id: 'user-jamie', name: 'Jamie', email: 'jamie@example.com', role_id: 'role-backend' },
      { id: 'user-priya', name: 'Priya', email: 'priya@example.com', role_id: 'role-devops' },
      { id: 'user-sam', name: 'Sam', email: 'sam@example.com', role_id: 'role-backend' },
    ]
    const draft = preset('draft', { role_ids: ['role-backend'] })
    expect(membersReceiving(draft, presets, { roles: [], members }).map(({ id }) => id)).toEqual(['user-sam'])
  })

  it('gives the owner the Admin role preset, as q-core does', () => {
    const roles = [
      { id: 'role-owner', name: 'Owner' },
      { id: 'role-admin', name: 'Admin' },
    ]
    const members = [{ id: 'user-alex', name: 'Alex', email: 'alex@example.com', role_id: 'role-owner' }]
    const draft = preset('admins', { role_ids: ['role-admin'] })

    expect(effectiveRoleId('role-owner', roles)).toBe('role-admin')
    expect(effectiveRoleId('role-admin', roles)).toBe('role-admin')
    expect(membersReceiving(draft, presets, { roles, members }).map(({ id }) => id)).toEqual(['user-alex'])
  })

  it('lists the targets another preset already holds', () => {
    const conflicts = assignmentConflicts(
      { organization_default: true, role_ids: ['role-devops', 'role-qa'], user_ids: ['user-jamie'] },
      presets
    )
    expect(conflicts.organizationDefault?.id).toBe('default')
    expect(conflicts.roles.map(({ roleId }) => roleId)).toEqual(['role-devops'])
    expect(conflicts.users.map(({ userId }) => userId)).toEqual(['user-jamie'])
  })

  it('recognizes templates by their flag', () => {
    expect(isTemplate({ is_template: true })).toBe(true)
    expect(isTemplate({ is_template: false })).toBe(false)
  })
})
