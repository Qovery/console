import { type BuildAnalysisResponse, type BuildAnalysisState } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useBuildAnalysis, useBuildAnalysisProgress, useStartBuildAnalysis } from '@qovery/domains/services/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BuildOptimizerButton } from './build-optimizer-button'

jest.mock('@qovery/domains/services/feature')
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1', executionId: 'exec-1' }),
}))

const useBuildAnalysisMock = useBuildAnalysis as jest.MockedFunction<typeof useBuildAnalysis>
const useStartBuildAnalysisMock = useStartBuildAnalysis as jest.MockedFunction<typeof useStartBuildAnalysis>
const useBuildAnalysisProgressMock = useBuildAnalysisProgress as jest.MockedFunction<typeof useBuildAnalysisProgress>

const environment = environmentFactoryMock(1)[0]

const analysisOf = (status: BuildAnalysisResponse['status'], executionId = 'exec-1'): BuildAnalysisResponse => ({
  service_id: 'service-1',
  execution_id: executionId,
  status,
  stale: false,
  dockerfile_source: 'GIT',
  failure_code: status === 'FAILED' ? 'MODEL_ERROR' : null,
  failure_reason: status === 'FAILED' ? 'The model returned an invalid result' : null,
  result:
    status === 'DONE'
      ? {
          confidence: 'HIGH',
          estimated_time_saved: { min_seconds: 50, max_seconds: 90 },
          assets_reviewed: ['DOCKERFILE'],
          summary: 'The dependency install step is not cached.',
          improvements: ['Copy package.json before the rest of the code'],
          agent_prompt: 'Speed up the Docker build.',
          dockerfile: null,
          dockerfile_rationale: null,
        }
      : null,
  created_at: '2026-11-06T10:00:00Z',
  updated_at: '2026-11-06T10:01:00Z',
})

function mockBuildAnalysisState(state?: BuildAnalysisState, isError = false) {
  useBuildAnalysisMock.mockReturnValue({ data: state, isError } as ReturnType<typeof useBuildAnalysis>)
}

const mutate = jest.fn()

function renderButton(isBuildSucceeded = true) {
  return renderWithProviders(
    <BuildOptimizerButton
      environment={environment}
      serviceId="service-1"
      serviceType="APPLICATION"
      isBuildSucceeded={isBuildSucceeded}
    />
  )
}

describe('BuildOptimizerButton', () => {
  beforeEach(() => {
    mutate.mockReset()
    useStartBuildAnalysisMock.mockReturnValue({ mutate, isLoading: false } as unknown as ReturnType<
      typeof useStartBuildAnalysis
    >)
    useBuildAnalysisProgressMock.mockReturnValue(undefined)
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: null })
  })

  it('is disabled until the build succeeded', () => {
    renderButton(false)

    expect(screen.getByRole('button', { name: 'Optimize' })).toBeDisabled()
  })

  it('is disabled on an older build', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-2', analysis: null })
    renderButton()

    expect(screen.getByRole('button', { name: 'Optimize' })).toBeDisabled()
  })

  it('reads the build analysis for the deployment being viewed', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: null })
    renderButton()

    expect(useBuildAnalysisMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ serviceId: 'service-1', serviceType: 'APPLICATION', executionId: 'exec-1' })
    )
  })

  it('is disabled when the build analysis cannot be read', () => {
    mockBuildAnalysisState(undefined, true)
    renderButton()

    expect(screen.getByRole('button', { name: 'Optimize' })).toBeDisabled()
  })

  it('starts the analysis of the latest build', async () => {
    const { userEvent } = renderButton()

    await userEvent.click(screen.getByRole('button', { name: 'Optimize' }))

    expect(mutate).toHaveBeenCalledWith(
      { serviceId: 'service-1', serviceType: 'APPLICATION', executionId: 'exec-1' },
      expect.anything()
    )
  })

  it('shows the analysis in progress, and follows it', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('ANALYSING') })
    renderButton()

    expect(screen.getByRole('button', { name: 'Analyzing...' })).toBeInTheDocument()
    expect(useBuildAnalysisProgressMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ serviceId: 'service-1', environmentId: environment.id, enabled: true })
    )
  })

  it('shows the current step of the analysis in the button', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('ANALYSING') })
    useBuildAnalysisProgressMock.mockReturnValue({
      status: 'ANALYSING',
      step: 'Reading the Dockerfile',
      terminal: false,
    })
    renderButton()

    expect(screen.getByRole('button', { name: 'Reading the Dockerfile...' })).toBeInTheDocument()
  })

  it('opens the analysis it started once it is done', async () => {
    // The build analysis query, as the start and the end of the analysis update it
    let setBuildAnalysisState: (state: BuildAnalysisState) => void = () => undefined
    useBuildAnalysisMock.mockImplementation(() => {
      const [state, setState] = useState<BuildAnalysisState>({ latest_build_execution_id: 'exec-1', analysis: null })
      setBuildAnalysisState = setState
      return { data: state, isError: false } as ReturnType<typeof useBuildAnalysis>
    })
    mutate.mockImplementation((_, options) => {
      setBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('PENDING') })
      options.onSuccess()
    })
    const { userEvent } = renderButton()

    await userEvent.click(screen.getByRole('button', { name: 'Optimize' }))
    expect(screen.getByRole('button', { name: 'Analyzing...' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Build optimization analysis' })).not.toBeInTheDocument()

    act(() => setBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('DONE') }))

    expect(screen.getByRole('heading', { name: 'Build optimization analysis' })).toBeInTheDocument()
  })

  it('reopens a finished analysis', async () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('DONE') })
    const { userEvent } = renderButton()

    await userEvent.click(screen.getByRole('button', { name: 'Open analysis' }))

    expect(screen.getByRole('heading', { name: 'Build optimization analysis' })).toBeInTheDocument()
    expect(screen.getByText('The dependency install step is not cached.')).toBeInTheDocument()
  })

  it('still opens a finished analysis when reading it again fails', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('DONE') }, true)
    renderButton()

    expect(screen.getByRole('button', { name: 'Open analysis' })).toBeEnabled()
  })

  it('opens the analysis of an older build', () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-2', analysis: analysisOf('DONE') })
    renderButton()

    expect(screen.getByRole('button', { name: 'Open analysis' })).toBeEnabled()
  })

  it('offers to retry a failed analysis', async () => {
    mockBuildAnalysisState({ latest_build_execution_id: 'exec-1', analysis: analysisOf('FAILED') })
    const { userEvent } = renderButton()

    await userEvent.click(screen.getByRole('button', { name: 'Optimize' }))

    expect(mutate).toHaveBeenCalled()
  })
})
