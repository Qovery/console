import { useParams } from '@tanstack/react-router'
import { act } from '@testing-library/react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  type BlueprintUpdatePreviewOutcome,
  useBlueprintUpdatePreviewSocket,
} from '../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { BlueprintUpdatePreviewStep } from './blueprint-update-preview-step'

jest.mock('../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket', () => ({
  useBlueprintUpdatePreviewSocket: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(),
}))

jest.mock('./blueprint-update-context', () => ({
  useBlueprintUpdateFlowContext: jest.fn(),
}))

function mockPreview({
  outcome,
  ...context
}: { outcome: BlueprintUpdatePreviewOutcome } & Partial<ReturnType<typeof useBlueprintUpdateFlowContext>>) {
  jest.mocked(useBlueprintUpdateFlowContext).mockReturnValue({
    clusterId: 'cluster-id',
    handleUpdate: jest.fn(),
    isUpdateLoading: false,
    previewId: 'preview-id',
    requestPreview: jest.fn(),
    retryPreview: jest.fn(),
    service: { name: 'AWS S3 Bucket' },
    ...context,
  } as ReturnType<typeof useBlueprintUpdateFlowContext>)
  jest.mocked(useBlueprintUpdatePreviewSocket).mockReturnValue({ outcome })
}

const confirmButton = () => screen.getByRole('button', { name: /Confirm & deploy update/i })

describe('BlueprintUpdatePreviewStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-id' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('requests a preview and keeps confirmation disabled while output is pending', () => {
    const requestPreview = jest.fn()
    const handleUpdate = jest.fn()
    mockPreview({ outcome: { type: 'pending' }, requestPreview, handleUpdate })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('heading', { name: 'Preview changes' })).toBeInTheDocument()
    expect(screen.getByLabelText('Waiting for preview output')).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
    expect(requestPreview).toHaveBeenCalledTimes(1)
    expect(useBlueprintUpdatePreviewSocket).toHaveBeenCalledWith({
      clusterId: 'cluster-id',
      organizationId: 'organization-id',
      previewId: 'preview-id',
    })
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('renders received output and enables confirmation', () => {
    mockPreview({ outcome: { type: 'diff', rawOutput: '+ created\n- removed\n~ changed' } })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByText('+ created')).toHaveClass('text-positive')
    expect(screen.getByText('- removed')).toHaveClass('text-negative')
    expect(screen.getByText('~ changed')).toHaveClass('text-info')
    expect(confirmButton()).toBeEnabled()
  })

  it('states that nothing changed instead of spinning forever, and still allows confirmation', () => {
    mockPreview({ outcome: { type: 'no-changes' } })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByText('No infrastructure changes detected.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Waiting for preview output')).not.toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()
  })

  it('surfaces the engine error message and blocks confirmation', () => {
    mockPreview({ outcome: { type: 'error', message: 'terraform init failed' } })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate the preview.')
    expect(screen.getByText('terraform init failed')).toBeInTheDocument()
    expect(screen.queryByLabelText('Waiting for preview output')).not.toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  it('surfaces the reason a timeout happened and blocks confirmation', () => {
    const reason = 'Terraform command (`terraform plan -no-color`) ran out of time and was stopped after 480s.'
    mockPreview({ outcome: { type: 'timeout', message: reason } })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('The preview timed out before completing.')
    expect(screen.getByText(reason)).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  it.each([
    [{ type: 'cancelled' } as const, 'The preview was cancelled.'],
    [{ type: 'timeout' } as const, 'The preview timed out before completing.'],
  ])('reports the %s outcome and blocks confirmation', (outcome, summary) => {
    mockPreview({ outcome })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(summary)
    expect(screen.queryByLabelText('Waiting for preview output')).not.toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  it('shows an explicit retry action when the preview request itself fails', async () => {
    const retryPreview = jest.fn()
    mockPreview({ outcome: { type: 'pending' }, previewError: true, previewId: undefined, retryPreview })

    const { userEvent } = renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate the preview.')

    await userEvent.click(screen.getByRole('button', { name: 'Retry preview' }))

    expect(retryPreview).toHaveBeenCalledTimes(1)
    expect(confirmButton()).toBeDisabled()
  })

  it('updates the loading message while waiting for preview output', () => {
    jest.useFakeTimers()
    mockPreview({ outcome: { type: 'pending' } })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByText('Generating preview output')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(8_000)
    })

    expect(screen.getByText('Analyzing the planned changes')).toBeInTheDocument()
  })
})
