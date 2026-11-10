import { type BuildAnalysisResponse, type BuildAnalysisResult } from 'qovery-typescript-axios'
import { getBuildOptimizerState } from './build-analysis'

const result: BuildAnalysisResult = {
  confidence: 'HIGH',
  estimated_time_saved: { min_seconds: 50, max_seconds: 90 },
  assets_reviewed: ['DOCKERFILE'],
  summary: 'The dependency install step is not cached.',
  improvements: ['Copy package.json before the rest of the code'],
  agent_prompt: 'Speed up the Docker build.',
  dockerfile: null,
  dockerfile_rationale: null,
}

const analysisOf = (executionId: string, status: BuildAnalysisResponse['status']): BuildAnalysisResponse => ({
  service_id: 'service-1',
  execution_id: executionId,
  status,
  stale: false,
  dockerfile_source: 'GIT',
  failure_code: status === 'FAILED' ? 'MODEL_ERROR' : null,
  failure_reason: status === 'FAILED' ? 'The model returned an invalid result' : null,
  result: status === 'DONE' ? result : null,
  created_at: '2026-11-06T10:00:00Z',
  updated_at: '2026-11-06T10:01:00Z',
})

describe('getBuildOptimizerState', () => {
  it('waits for the build to succeed', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-1', analysis: null },
        executionId: 'exec-1',
        isBuildSucceeded: false,
      })
    ).toEqual({ type: 'BUILD_NOT_SUCCEEDED' })
  })

  it('waits for the build analysis state', () => {
    expect(getBuildOptimizerState({ executionId: 'exec-1', isBuildSucceeded: true })).toEqual({ type: 'LOADING' })
  })

  it('offers to analyse the latest build when it has no analysis', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-1', analysis: null },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'READY' })
  })

  it('offers to analyse the latest build when the analysis is of an older build', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-2', analysis: analysisOf('exec-1', 'DONE') },
        executionId: 'exec-2',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'READY' })
  })

  it.each(['PENDING', 'COLLECTING', 'ANALYSING'] as const)('is analyzing while the analysis is %s', (status) => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-1', analysis: analysisOf('exec-1', status) },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'ANALYZING' })
  })

  it('opens the result of a finished analysis', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-1', analysis: analysisOf('exec-1', 'DONE') },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'DONE', result })
  })

  it('keeps the analysis of an older build readable', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-2', analysis: analysisOf('exec-1', 'DONE') },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'DONE', result })
  })

  it('cannot analyse an older build', () => {
    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-2', analysis: null },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'NOT_LATEST_BUILD' })
  })

  it('offers to retry a failed analysis', () => {
    const failedAnalysis = analysisOf('exec-1', 'FAILED')

    expect(
      getBuildOptimizerState({
        buildAnalysisState: { latest_build_execution_id: 'exec-1', analysis: failedAnalysis },
        executionId: 'exec-1',
        isBuildSucceeded: true,
      })
    ).toEqual({ type: 'READY', failedAnalysis })
  })
})
