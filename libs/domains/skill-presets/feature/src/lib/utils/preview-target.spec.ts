import { describeResolution, previewTargets, resolvePreviewTarget } from './preview-target'

const assignees = {
  roles: [
    { id: 'role-devops', name: 'Devops' },
    { id: 'role-owner', name: 'Owner' },
    { id: 'role-admin', name: 'Admin' },
  ],
  members: [
    { id: 'user-priya', name: 'Priya Shah', email: 'priya.shah@example.com', role_id: 'role-devops' },
    { id: 'user-jamie', name: 'Jamie Rossi', email: 'jamie.rossi@example.com', role_id: 'role-devops' },
  ],
}
const presets = [
  {
    id: 'platform',
    name: 'Platform',
    assigned_to: { organization_default: false, role_ids: ['role-devops'], user_ids: [] },
  },
  {
    id: 'jamie',
    name: 'Jamie only',
    assigned_to: { organization_default: false, role_ids: [], user_ids: ['user-jamie'] },
  },
  {
    id: 'admins',
    name: 'Admins',
    assigned_to: { organization_default: false, role_ids: ['role-admin'], user_ids: [] },
  },
]

describe('preview target', () => {
  it('lists members first, then roles', () => {
    const targets = previewTargets(assignees)
    expect(targets.map(({ value }) => value)).toEqual([
      'user:user-priya',
      'user:user-jamie',
      'role:role-devops',
      'role:role-owner',
      'role:role-admin',
    ])
    expect(targets[2].label).toBe('Anyone with the Devops role')
  })

  it('prefers a direct assignment to the member', () => {
    const resolved = resolvePreviewTarget('user:user-jamie', presets, assignees)
    expect(describeResolution(resolved)).toBe('Jamie only (assigned to the member)')
  })

  it('gives the Owner role the Admin role preset', () => {
    expect(describeResolution(resolvePreviewTarget('role:role-owner', presets, assignees))).toBe(
      'Admins (from their role)'
    )
  })

  it('falls back to generic labels for unknown ids', () => {
    expect(resolvePreviewTarget('user:user-unknown', presets, assignees).targetLabel).toBe('This member')
    expect(resolvePreviewTarget('role:role-unknown', presets, assignees).targetLabel).toBe('This role')
  })

  it('resolves a member through their role', () => {
    const resolved = resolvePreviewTarget('user:user-priya', presets, assignees)
    expect(resolved.targetLabel).toBe('Priya Shah')
    expect(describeResolution(resolved)).toBe('Platform (from their role)')
  })

  it('says when no preset applies', () => {
    expect(describeResolution(resolvePreviewTarget('role:role-other', presets, assignees))).toBe(
      'No preset: Qovery skills as published'
    )
  })
})
