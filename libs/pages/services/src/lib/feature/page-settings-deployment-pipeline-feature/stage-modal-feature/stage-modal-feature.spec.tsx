import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { DeploymentStageResponse } from 'qovery-typescript-axios'
import * as environmentDomains from '@qovery/domains/environment'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { StageModalFeature, StageModalFeatureProps } from './stage-modal-feature'

const useCreateEnvironmentDeploymentStageMockSpy = jest.spyOn(
  environmentDomains,
  'useCreateEnvironmentDeploymentStage'
) as jest.Mock
const useEditEnvironmentDeploymentStageMockSpy = jest.spyOn(
  environmentDomains,
  'useEditEnvironmentDeploymentStage'
) as jest.Mock

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
    const { getByLabelText, getByText } = render(<StageModalFeature {...props} />)
    expect(getByLabelText(/name/i)).toHaveValue(stage.name)
    expect(getByLabelText(/description/i)).toHaveValue(stage.description)
    expect(getByText(/confirm/i)).toBeInTheDocument()
  })

  it('should submits the form with createEnvironmentDeploymentStage when no stage is provided', async () => {
    useCreateEnvironmentDeploymentStageMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })

    const { getByTestId, getByLabelText } = render(
      <StageModalFeature onClose={onClose} environmentId={environmentId} />
    )

    const inputName = getByTestId('input-name')
    const inputDescription = getByLabelText(/description/i)
    const submitButton = getByTestId('submit-button')

    await act(async () => {
      fireEvent.change(inputName, { target: { value: 'New Stage' } })
      fireEvent.change(inputDescription, { target: { value: 'New Stage Description' } })
    })

    expect(submitButton).not.toBeDisabled()

    await act(() => {
      submitButton.click()
    })

    expect(useCreateEnvironmentDeploymentStageMockSpy).toHaveBeenCalled()
    expect(useCreateEnvironmentDeploymentStageMockSpy).toHaveBeenCalledWith(
      environmentId,
      onClose,
      expect.any(Function)
    )
    expect(
      useCreateEnvironmentDeploymentStageMockSpy(environmentId, onClose, expect.any(Function)).mutate
    ).toHaveBeenCalledWith({
      data: { name: 'New Stage', description: 'New Stage Description' },
    })
  })

  it('should submits the form with editEnvironmentDeploymentStage when a stage is provided', async () => {
    useEditEnvironmentDeploymentStageMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })

    const { getByLabelText, getByTestId } = render(<StageModalFeature {...props} />)

    const inputName = getByTestId('input-name')
    const inputDescription = getByLabelText(/description/i)
    const submitButton = getByTestId('submit-button')

    await act(async () => {
      fireEvent.change(inputName, { target: { value: 'Updated Stage' } })
      fireEvent.change(inputDescription, { target: { value: 'Updated Stage Description' } })
    })

    expect(submitButton).not.toBeDisabled()

    await act(() => {
      submitButton.click()
      expect(useEditEnvironmentDeploymentStageMockSpy).toHaveBeenCalled()
    })

    expect(useEditEnvironmentDeploymentStageMockSpy).toHaveBeenCalledWith(environmentId, onClose, expect.any(Function))
    expect(
      useEditEnvironmentDeploymentStageMockSpy(environmentId, onClose, expect.any(Function)).mutate
    ).toHaveBeenCalledWith({
      stageId: stage.id,
      data: {
        name: 'Updated Stage',
        description: 'Updated Stage Description',
      },
    })
  })
})
