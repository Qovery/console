import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import * as environmentDomains from '@qovery/domains/environments/feature'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { StageModalFeature, type StageModalFeatureProps } from './stage-modal-feature'

const useCreateEnvironmentDeploymentStageMockSpy = jest.spyOn(
  environmentDomains,
  'useCreateDeploymentStage'
) as jest.Mock
const useEditEnvironmentDeploymentStageMockSpy = jest.spyOn(environmentDomains, 'useEditDeploymentStage') as jest.Mock

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
    const mutateAsync = jest.fn()
    useCreateEnvironmentDeploymentStageMockSpy.mockReturnValue({
      mutateAsync,
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

    expect(mutateAsync).toHaveBeenCalledWith({
      environmentId,
      payload: { name: 'New Stage', description: 'New Stage Description' },
    })
  })

  it('should submits the form with editEnvironmentDeploymentStage when a stage is provided', async () => {
    const mutateAsync = jest.fn()
    useEditEnvironmentDeploymentStageMockSpy.mockReturnValue({
      mutateAsync,
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
    })

    expect(mutateAsync).toHaveBeenCalledWith({
      stageId: stage.id,
      payload: {
        name: 'Updated Stage',
        description: 'Updated Stage Description',
      },
    })
  })
})
