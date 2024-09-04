import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useCreateDeploymentStage, useEditDeploymentStage } from '@qovery/domains/environments/feature'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { StageModalFeature, type StageModalFeatureProps } from './stage-modal-feature'

jest.mock('@qovery/domains/environments/feature', () => {
  const mutateAsync1 = jest.fn()
  const mutateAsync2 = jest.fn()
  return {
    ...jest.requireActual('@qovery/domains/environments/feature'),
    useCreateDeploymentStage: () => ({
      mutateAsync: mutateAsync1,
    }),
    useEditDeploymentStage: () => ({
      mutateAsync: mutateAsync2,
    }),
  }
})

describe('StageModalFeature', () => {
  const onClose = jest.fn()
  const environmentId = '123'
  const stage: DeploymentStageResponse = deploymentStagesFactoryMock(1)[0]
  const props: StageModalFeatureProps = {
    onClose,
    environmentId,
    stage,
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should renders the StageModal with stage values when editing', () => {
    renderWithProviders(<StageModalFeature {...props} />)
    expect(screen.getByLabelText(/name/i)).toHaveValue(stage.name)
    expect(screen.getByLabelText(/description/i)).toHaveValue(stage.description)
    expect(screen.getByText(/confirm/i)).toBeInTheDocument()
  })

  it('should submits the form with createEnvironmentDeploymentStage when no stage is provided', async () => {
    const { userEvent } = renderWithProviders(<StageModalFeature onClose={onClose} environmentId={environmentId} />)

    const inputName = screen.getByTestId('input-name')
    const inputDescription = screen.getByLabelText(/description/i)
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'New Stage')
    await userEvent.clear(inputDescription)
    await userEvent.type(inputDescription, 'New Stage Description')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(useCreateDeploymentStage().mutateAsync).toHaveBeenCalledWith({
      environmentId,
      payload: { name: 'New Stage', description: 'New Stage Description' },
    })
  })

  it('should submits the form with editEnvironmentDeploymentStage when a stage is provided', async () => {
    const { userEvent } = renderWithProviders(<StageModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputDescription = screen.getByLabelText(/description/i)
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'Updated Stage')
    await userEvent.clear(inputDescription)
    await userEvent.type(inputDescription, 'Updated Stage Description')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(useEditDeploymentStage().mutateAsync).toHaveBeenCalledWith({
      stageId: stage.id,
      payload: {
        name: 'Updated Stage',
        description: 'Updated Stage Description',
      },
    })
  })
})
