import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StageOrderModal, { type StageOrderModalProps } from './stage-order-modal'

const stages = deploymentStagesFactoryMock(3)

const props: StageOrderModalProps = {
  currentStages: stages,
  setCurrentStages: jest.fn(),
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('StageOrderModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StageOrderModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  test('should renders the stages in the correct order', () => {
    renderWithProviders(<StageOrderModal {...props} />)

    const stage1 = screen.getByText(stages[0].name || '')
    const stage2 = screen.getByText(stages[1].name || '')
    const stage3 = screen.getByText(stages[2].name || '')
    expect(stage1).toBeInTheDocument()
    expect(stage2).toBeInTheDocument()
    expect(stage3).toBeInTheDocument()
  })

  test('should calls onClose when cancel button is clicked', async () => {
    const { userEvent } = renderWithProviders(<StageOrderModal {...props} />)

    const cancelButton = screen.getByTestId('cancel-button')
    await userEvent.click(cancelButton)
    expect(props.onClose).toHaveBeenCalled()
  })
})
