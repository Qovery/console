import { describeResolution, previewTargets, resolvePreviewTarget } from './preview-target'

const assignees = {
  roles: [{ id: 'role-devops', name: 'Devops' }],
  members: [{ id: 'user-priya', name: 'Priya Shah', email: 'priya.shah@example.com', role_id: 'role-devops' }],
}
const presets = [
  {
    id: 'platform',
    name: 'Platform',
    assigned_to: { organization_default: false, role_ids: ['role-devops'], user_ids: [] },
  },
]

describe('preview target', () => {
  it('lists members first, then roles', () => {
    expect(previewTargets(assignees).map(({ value }) => value)).toEqual(['user:user-priya', 'role:role-devops'])
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
