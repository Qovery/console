import { type BlueprintUpdateResponse } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { BlueprintUpdateFlow } from './blueprint-update-flow'

const mockDeployBlueprint = jest.fn()
const mockPreviewBlueprintUpdate = jest.fn()
const mockUpdateBlueprint = jest.fn()

jest.mock('../../hooks/use-blueprint-update/use-blueprint-update', () => ({
  useBlueprintUpdate: () => ({
    data: {
      is_up_to_date: false,
      current_tag: 'AWS/mysql/8/1.2.3',
      latest_tag: 'AWS/mysql/8/1.3.0',
      new_required_values: [],
      new_optional_values: [],
      now_required_values: [],
      updated_values: [],
      removed_values: [],
      engine_diff: { updated_values: [] },
    } satisfies BlueprintUpdateResponse,
  }),
}))

jest.mock('../../hooks/use-deploy-blueprint/use-deploy-blueprint', () => ({
  useDeployBlueprint: () => ({ mutateAsync: mockDeployBlueprint, isLoading: false }),
}))

jest.mock('../../hooks/use-preview-blueprint-update/use-preview-blueprint-update', () => ({
  usePreviewBlueprintUpdate: () => ({ mutateAsync: mockPreviewBlueprintUpdate, isLoading: false }),
}))

jest.mock('../../hooks/use-update-blueprint/use-update-blueprint', () => ({
  useUpdateBlueprint: () => ({ mutateAsync: mockUpdateBlueprint, isLoading: false }),
}))

jest.mock('./blueprint-update-flow-shell', () => ({
  BlueprintUpdateFlowShell: ({ children }: { children: React.ReactNode }) => children,
}))

function ConfirmUpdateButton() {
  const { handleUpdate } = useBlueprintUpdateFlowContext()

  return (
    <button type="button" onClick={() => void handleUpdate()}>
      Confirm
    </button>
  )
}

function PreviewRequester() {
  const { previewError, requestPreview } = useBlueprintUpdateFlowContext()

  useEffect(() => {
    void requestPreview()
  }, [requestPreview])

  return previewError ? <span>Preview failed</span> : null
}

describe('BlueprintUpdateFlow', () => {
  const service = {
    id: 'service-id',
    name: 'mysql',
    icon_uri: null,
    service_type: 'TERRAFORM',
    serviceType: 'TERRAFORM',
  } as AnyService

  beforeEach(() => {
    mockUpdateBlueprint.mockResolvedValue({})
    mockDeployBlueprint.mockResolvedValue({})
    mockPreviewBlueprintUpdate.mockResolvedValue({ preview_id: 'preview-id' })
  })

  it('deploys the saved blueprint update before exiting', async () => {
    const onExit = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintUpdateFlow
        blueprintId="blueprint-id"
        currentStep={2}
        environmentId="environment-id"
        onExit={onExit}
        service={service}
      >
        <ConfirmUpdateButton />
      </BlueprintUpdateFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockUpdateBlueprint).toHaveBeenCalledWith({
        blueprintId: 'blueprint-id',
        payload: expect.objectContaining({ tag: 'AWS/mysql/8/1.3.0' }),
      })
      expect(mockDeployBlueprint).toHaveBeenCalledWith({ blueprintId: 'blueprint-id' })
      expect(onExit).toHaveBeenCalled()
    })
    expect(mockUpdateBlueprint.mock.invocationCallOrder[0]).toBeLessThan(
      mockDeployBlueprint.mock.invocationCallOrder[0]
    )
  })

  it('does not retry a failed preview automatically', async () => {
    mockPreviewBlueprintUpdate.mockRejectedValue(new Error('Preview failed'))

    renderWithProviders(
      <BlueprintUpdateFlow
        blueprintId="blueprint-id"
        currentStep={2}
        environmentId="environment-id"
        onExit={jest.fn()}
        service={service}
      >
        <PreviewRequester />
      </BlueprintUpdateFlow>
    )

    await waitFor(() => expect(screen.getByText('Preview failed')).toBeInTheDocument())

    expect(mockPreviewBlueprintUpdate).toHaveBeenCalledTimes(1)
  })
})
