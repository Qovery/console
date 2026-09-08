import { getClusterLogStepLabel } from './cluster-log-step-label'

describe('getClusterLogStepLabel', () => {
  it('shortens the Engine v2 result label', () => {
    expect(getClusterLogStepLabel('PlatformExecutionResult')).toBe('Summary')
  })

  it.each(['Start', 'Create', 'Diff', 'Preflight', 'Created', 'Terminated', 'NewFutureStep'])(
    'preserves the %s label',
    (step) => expect(getClusterLogStepLabel(step)).toBe(step)
  )

  it('handles an absent step', () => {
    expect(getClusterLogStepLabel(undefined)).toBe('')
  })
})
