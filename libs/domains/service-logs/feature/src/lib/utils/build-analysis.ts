import { type BuildAnalysisResponse, type BuildAnalysisResult, type BuildAnalysisState } from 'qovery-typescript-axios'

export type BuildOptimizerState =
  // The build is analysed once it went through
  | { type: 'BUILD_NOT_SUCCEEDED' }
  | { type: 'LOADING' }
  // Only the latest build of the service can be analysed
  | { type: 'NOT_LATEST_BUILD' }
  | { type: 'ANALYZING' }
  | { type: 'DONE'; result: BuildAnalysisResult }
  // `failedAnalysis` is set when the last analysis of this build failed
  | { type: 'READY'; failedAnalysis?: BuildAnalysisResponse }

/**
 * What the Optimize button of a build offers, from the build analysis state of its service.
 */
export function getBuildOptimizerState({
  buildAnalysisState,
  executionId,
  isBuildSucceeded,
}: {
  buildAnalysisState?: BuildAnalysisState
  executionId: string
  isBuildSucceeded: boolean
}): BuildOptimizerState {
  if (!isBuildSucceeded) return { type: 'BUILD_NOT_SUCCEEDED' }
  if (!buildAnalysisState) return { type: 'LOADING' }

  // The service keeps one analysis, which can be of another build
  const analysis = buildAnalysisState.analysis?.execution_id === executionId ? buildAnalysisState.analysis : undefined

  if (analysis?.status === 'PENDING' || analysis?.status === 'COLLECTING' || analysis?.status === 'ANALYSING') {
    return { type: 'ANALYZING' }
  }
  // An analysis stays readable once its build is no longer the latest
  if (analysis?.status === 'DONE' && analysis.result) return { type: 'DONE', result: analysis.result }
  if (buildAnalysisState.latest_build_execution_id !== executionId) return { type: 'NOT_LATEST_BUILD' }

  return { type: 'READY', failedAnalysis: analysis?.status === 'FAILED' ? analysis : undefined }
}
