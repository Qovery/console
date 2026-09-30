import { getTriggerAction } from './deployment-action'

describe('getTriggerAction', () => {
  it('returns undefined without status details', () => {
    expect(getTriggerAction(undefined)).toBeUndefined()
  })

  it('prefers the sub action when it is set', () => {
    expect(getTriggerAction({ action: 'DEPLOY', sub_action: 'TERRAFORM_DESTROY' })).toBe('TERRAFORM_DESTROY')
  })

  it('returns the action when the sub action is NONE or missing', () => {
    expect(getTriggerAction({ action: 'STOP', sub_action: 'NONE' })).toBe('STOP')
    expect(getTriggerAction({ action: 'RESTART' })).toBe('RESTART')
  })

  it('falls back to UNKNOWN when status details have no action', () => {
    expect(getTriggerAction({})).toBe('UNKNOWN')
  })
})
