import { type BuildAnalysisResponse, type BuildAnalysisStatus } from 'qovery-typescript-axios'
import { getBuildAnalysisRefetchInterval } from './use-build-analysis'

function stateWith(status: BuildAnalysisStatus) {
  return {
    latest_build_execution_id: 'exec-1',
    analysis: { execution_id: 'exec-1', status } as BuildAnalysisResponse,
  }
}

describe('getBuildAnalysisRefetchInterval', () => {
  it('reads the state again while an analysis runs', () => {
    expect(getBuildAnalysisRefetchInterval(stateWith('PENDING'))).toBe(10_000)
    expect(getBuildAnalysisRefetchInterval(stateWith('COLLECTING'))).toBe(10_000)
    expect(getBuildAnalysisRefetchInterval(stateWith('ANALYSING'))).toBe(10_000)
  })

  it('stops once the analysis ended, or without one', () => {
    expect(getBuildAnalysisRefetchInterval(stateWith('DONE'))).toBe(false)
    expect(getBuildAnalysisRefetchInterval(stateWith('FAILED'))).toBe(false)
    expect(getBuildAnalysisRefetchInterval({ latest_build_execution_id: 'exec-1', analysis: null })).toBe(false)
    expect(getBuildAnalysisRefetchInterval(undefined)).toBe(false)
  })
})
