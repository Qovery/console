import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { EnvironmentDeploymentStageModal } from './environment-deployment-stage-modal'

const mockCreateDeploymentStage = jest.fn()
const mockEditDeploymentStage = jest.fn()
const mockEnableAlertClickOutside = jest.fn()
const mockOnClose = jest.fn()

jest.mock('../../hooks/use-create-deployment-stage/use-create-deployment-stage', () => ({
  useCreateDeploymentStage: () => ({
    mutateAsync: mockCreateDeploymentStage,
  }),
}))

jest.mock('../../hooks/use-edit-deployment-stage/use-edit-deployment-stage', () => ({
  useEditDeploymentStage: () => ({
    mutateAsync: mockEditDeploymentStage,
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    enableAlertClickOutside: mockEnableAlertClickOutside,
  }),
}))

describe('EnvironmentDeploymentStageModal', () => {
  const stage = {
    ...deploymentStagesFactoryMock(1)[0],
    id: 'stage-1',
    name: 'Build',
    description: 'Compile and package',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateDeploymentStage.mockResolvedValue(undefined)
    mockEditDeploymentStage.mockResolvedValue(undefined)
  })

  it('prefills the form in edit mode', () => {
    renderWithProviders(<EnvironmentDeploymentStageModal environmentId="env-1" onClose={mockOnClose} stage={stage} />)

    expect(screen.getByLabelText('Name')).toHaveValue('Build')
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('Compile and package')
  })

  it('creates a stage', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentDeploymentStageModal environmentId="env-1" onClose={mockOnClose} />
    )

    await userEvent.type(screen.getByLabelText('Name'), 'Deploy')
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'Deploy workloads')
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateDeploymentStage).toHaveBeenCalledWith({
        environmentId: 'env-1',
        payload: {
          name: 'Deploy',
          description: 'Deploy workloads',
        },
      })
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('edits a stage', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentDeploymentStageModal environmentId="env-1" onClose={mockOnClose} stage={stage} />
    )

    await userEvent.clear(screen.getByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'Release')
    await userEvent.clear(screen.getByLabelText('Description (optional)'))
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'Release services')
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockEditDeploymentStage).toHaveBeenCalledWith({
        stageId: 'stage-1',
        payload: {
          name: 'Release',
          description: 'Release services',
        },
      })
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('enables the unsaved changes alert when the form becomes dirty', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentDeploymentStageModal environmentId="env-1" onClose={mockOnClose} />
    )

    await userEvent.type(screen.getByLabelText('Name'), 'Deploy')

    await waitFor(() => {
      expect(mockEnableAlertClickOutside).toHaveBeenCalledWith(true)
    })
  })
})
