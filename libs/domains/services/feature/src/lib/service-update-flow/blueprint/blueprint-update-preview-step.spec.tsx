import { useParams } from '@tanstack/react-router'
import { act } from '@testing-library/react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useBlueprintUpdatePreviewSocket } from '../../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { BlueprintUpdatePreviewStep } from './blueprint-update-preview-step'

jest.mock('../../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket', () => ({
  useBlueprintUpdatePreviewSocket: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(),
}))

jest.mock('./blueprint-update-context', () => ({
  useBlueprintUpdateFlowContext: jest.fn(),
}))

describe('BlueprintUpdatePreviewStep', () => {
  beforeEach(() => {
    jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-id' })
  })

  it('requests a preview and keeps confirmation disabled while output is loading', () => {
    const requestPreview = jest.fn()
    const handleUpdate = jest.fn()
    const context = {
      clusterId: 'cluster-id',
      handleUpdate,
      isUpdateLoading: false,
      previewId: 'preview-id',
      requestPreview,
      service: { name: 'AWS S3 Bucket' },
    } as ReturnType<typeof useBlueprintUpdateFlowContext>

    jest.mocked(useBlueprintUpdateFlowContext).mockReturnValue(context)
    jest.mocked(useBlueprintUpdatePreviewSocket).mockReturnValue({
      hasReceivedMessage: false,
      isLoading: true,
      rawOutput: undefined,
    })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('heading', { name: 'Preview changes' })).toBeInTheDocument()
    expect(screen.getByLabelText('Waiting for preview output')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirm & deploy update/i })).toBeDisabled()
    expect(requestPreview).toHaveBeenCalledTimes(1)
    expect(useBlueprintUpdatePreviewSocket).toHaveBeenCalledWith({
      clusterId: 'cluster-id',
      organizationId: 'organization-id',
      previewId: 'preview-id',
    })
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('renders received output and enables confirmation', () => {
    jest.mocked(useBlueprintUpdateFlowContext).mockReturnValue({
      clusterId: 'cluster-id',
      handleUpdate: jest.fn(),
      isUpdateLoading: false,
      previewId: 'preview-id',
      requestPreview: jest.fn(),
      service: { name: 'AWS S3 Bucket' },
    } as ReturnType<typeof useBlueprintUpdateFlowContext>)
    jest.mocked(useBlueprintUpdatePreviewSocket).mockReturnValue({
      hasReceivedMessage: true,
      isLoading: false,
      rawOutput: '+ created\n- removed\n~ changed',
    })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByText('+ created')).toHaveClass('text-positive')
    expect(screen.getByText('- removed')).toHaveClass('text-negative')
    expect(screen.getByText('~ changed')).toHaveClass('text-info')
    expect(screen.getByRole('button', { name: /Confirm & deploy update/i })).toBeEnabled()
  })

  it('shows an explicit retry action when preview generation fails', async () => {
    const retryPreview = jest.fn()

    jest.mocked(useBlueprintUpdateFlowContext).mockReturnValue({
      clusterId: 'cluster-id',
      handleUpdate: jest.fn(),
      isUpdateLoading: false,
      previewError: true,
      previewId: undefined,
      requestPreview: jest.fn(),
      retryPreview,
      service: { name: 'AWS S3 Bucket' },
    } as ReturnType<typeof useBlueprintUpdateFlowContext>)

    const { userEvent } = renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate the preview.')

    await userEvent.click(screen.getByRole('button', { name: 'Retry preview' }))

    expect(retryPreview).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /Confirm & deploy update/i })).toBeDisabled()
  })

  it('updates the loading message while waiting for preview output', () => {
    jest.useFakeTimers()
    jest.mocked(useBlueprintUpdateFlowContext).mockReturnValue({
      clusterId: 'cluster-id',
      handleUpdate: jest.fn(),
      isUpdateLoading: false,
      previewId: 'preview-id',
      requestPreview: jest.fn(),
      service: { name: 'AWS S3 Bucket' },
    } as ReturnType<typeof useBlueprintUpdateFlowContext>)
    jest.mocked(useBlueprintUpdatePreviewSocket).mockReturnValue({
      hasReceivedMessage: false,
      isLoading: true,
      rawOutput: undefined,
    })

    renderWithProviders(<BlueprintUpdatePreviewStep onBack={jest.fn()} />)

    expect(screen.getByText('Generating preview output')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(8_000)
    })

    expect(screen.getByText('Analyzing the planned changes')).toBeInTheDocument()
    jest.useRealTimers()
  })
})
