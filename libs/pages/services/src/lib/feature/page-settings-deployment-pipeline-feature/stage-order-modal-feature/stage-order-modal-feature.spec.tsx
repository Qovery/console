import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { DeploymentStageResponse } from 'qovery-typescript-axios'
import * as storeEnvironment from '@qovery/domains/environment'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { StageModalFeature, StageModalFeatureProps } from './stage-order-modal-feature'

import SpyInstance = jest.SpyInstance

jest.mock('@qovery/domains/environment', () => ({
  ...jest.requireActual('@qovery/domains/environment'),
  createEnvironmentDeploymentStage: jest.fn(),
  editEnvironmentDeploymentStage: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

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
    const createEnvironmentDeploymentStageSpy: SpyInstance = jest.spyOn(
      storeEnvironment,
      'createEnvironmentDeploymentStage'
    )
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

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

    expect(createEnvironmentDeploymentStageSpy).toHaveBeenCalledWith({
      environmentId,
      data: {
        name: 'New Stage',
        description: 'New Stage Description',
      },
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should submits the form with editEnvironmentDeploymentStage when a stage is provided', async () => {
    const editEnvironmentDeploymentStageSpy: SpyInstance = jest.spyOn(
      storeEnvironment,
      'editEnvironmentDeploymentStage'
    )
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

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

    expect(editEnvironmentDeploymentStageSpy).toHaveBeenCalledWith({
      stageId: stage.id,
      environmentId,
      data: {
        name: 'Updated Stage',
        description: 'Updated Stage Description',
      },
    })
    expect(onClose).toHaveBeenCalled()
  })
})
