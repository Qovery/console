import { type BuildAnalysisResult } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BuildOptimizationModal } from './build-optimization-modal'

const analysis: BuildAnalysisResult = {
  confidence: 'HIGH',
  estimated_time_saved: { min_seconds: 50, max_seconds: 90 },
  assets_reviewed: ['DOCKERFILE', 'DOCKERIGNORE', 'BUILD_LOGS', 'BUILD_SETTINGS'],
  summary: 'The dependency install step is not cached.',
  improvements: ['Copy package.json before the rest of the code', 'Use a multi-stage build', 'Add a .dockerignore'],
  agent_prompt: 'Speed up the Docker build of this Node.js app.',
  dockerfile: 'FROM node:22-alpine\nARG NPM_TOKEN=<redacted>\nCOPY package*.json ./',
  dockerfile_rationale: 'Dependencies stay cached until package.json changes.',
}

describe('BuildOptimizationModal', () => {
  it('shows the analysis', () => {
    renderWithProviders(<BuildOptimizationModal analysis={analysis} onClose={jest.fn()} />)

    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('50s – 1min 30s')).toBeInTheDocument()
    expect(screen.getByText('.dockerignore')).toBeInTheDocument()
    expect(screen.getByText('Build settings')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('shows the text between backticks as inline code', () => {
    renderWithProviders(
      <BuildOptimizationModal
        analysis={{
          ...analysis,
          summary: '`RUN yarn install` took 104.9 s and `/root/.yarn` is not used',
          improvements: [
            'Move the `ARG` block',
            'Keep the unmatched ` backtick',
            'Use `--frozen-lockfile and `yarn ci` instead',
          ],
          dockerfile_rationale: 'The `ARG` block moves after the install.',
        }}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText('RUN yarn install', { selector: 'code' })).toBeInTheDocument()
    expect(screen.getByText('/root/.yarn', { selector: 'code' })).toBeInTheDocument()
    expect(screen.getAllByText('ARG', { selector: 'code' })).toHaveLength(2)
    expect(screen.getByText('Keep the unmatched ` backtick')).toBeInTheDocument()
    // An unmatched backtick before a code span doesn't pair with its opening backtick
    expect(screen.getByText('yarn ci', { selector: 'code' })).toBeInTheDocument()
    expect(screen.getByText(/Use `--frozen-lockfile and/)).toBeInTheDocument()
    expect(screen.queryByText(/`/, { selector: 'code' })).not.toBeInTheDocument()
  })

  it('shows the prompt for AI agents once expanded', async () => {
    const { userEvent } = renderWithProviders(<BuildOptimizationModal analysis={analysis} onClose={jest.fn()} />)

    const promptToggle = screen.getByRole('button', { name: 'Prompt for AI agents' })
    expect(screen.queryByText(/Speed up the Docker build/)).not.toBeInTheDocument()

    await userEvent.click(promptToggle)

    expect(promptToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Speed up the Docker build/)).toBeInTheDocument()
  })

  it('shows the reworked Dockerfile once expanded, and warns about redacted values', async () => {
    const { userEvent } = renderWithProviders(<BuildOptimizationModal analysis={analysis} onClose={jest.fn()} />)

    expect(screen.getByText('Dependencies stay cached until package.json changes.')).toBeInTheDocument()
    expect(screen.getByText(/put them back before using this Dockerfile/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reworked Dockerfile' }))

    expect(screen.getByText(/FROM node:22-alpine/)).toBeInTheDocument()
  })

  it('leaves out what the analysis has nothing to say about', () => {
    renderWithProviders(
      <BuildOptimizationModal
        analysis={{
          ...analysis,
          estimated_time_saved: null,
          improvements: [],
          dockerfile: null,
          dockerfile_rationale: null,
        }}
        onClose={jest.fn()}
      />
    )

    expect(screen.queryByText('Estimated time saved')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reworked Dockerfile' })).not.toBeInTheDocument()
    expect(screen.getByText('No improvement found: this build is already efficient.')).toBeInTheDocument()
  })

  it('shows the time saved as a share of the build duration', () => {
    renderWithProviders(<BuildOptimizationModal analysis={analysis} buildDurationSec={180} onClose={jest.fn()} />)

    expect(screen.getByText('50s – 1min 30s', { exact: false })).toHaveTextContent('50s – 1min 30s (28–50%)')
  })

  it('shows a single duration when the estimate is not a range', () => {
    renderWithProviders(
      <BuildOptimizationModal
        analysis={{ ...analysis, estimated_time_saved: { min_seconds: 30, max_seconds: 30 } }}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText('30s')).toBeInTheDocument()
  })

  it('closes', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<BuildOptimizationModal analysis={analysis} onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
