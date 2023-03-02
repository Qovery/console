import { render } from '__tests__/utils/setup-jest'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import StageOrderModal, { StageOrderModalProps } from './stage-order-modal'

const stages = deploymentStagesFactoryMock(3)

const props: StageOrderModalProps = {
  currentStages: stages,
  setCurrentStages: jest.fn(),
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('StageOrderModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StageOrderModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  test('should renders the stages in the correct order', () => {
    const { getByText } = render(<StageOrderModal {...props} />)

    const stage1 = getByText(stages[0].name || '')
    const stage2 = getByText(stages[1].name || '')
    const stage3 = getByText(stages[2].name || '')
    expect(stage1).toBeInTheDocument()
    expect(stage2).toBeInTheDocument()
    expect(stage3).toBeInTheDocument()
  })

  test('should calls onClose when cancel button is clicked', () => {
    const { getByTestId } = render(<StageOrderModal {...props} />)

    const cancelButton = getByTestId('cancel-button')
    cancelButton.click()
    expect(props.onClose).toHaveBeenCalled()
  })
})
