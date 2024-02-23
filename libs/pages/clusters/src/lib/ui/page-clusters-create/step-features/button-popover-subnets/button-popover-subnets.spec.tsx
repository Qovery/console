import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ButtonPopoverSubnets from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ButtonPopoverSubnets title="EKS subnets" name="eks_subnets">
        EKS
      </ButtonPopoverSubnets>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should open popover', async () => {
    const { userEvent } = renderWithProviders(
      <ButtonPopoverSubnets title="EKS subnets" name="eks_subnets">
        EKS
      </ButtonPopoverSubnets>
    )

    const button = screen.getByText('EKS')
    await userEvent.click(button)

    const popover = screen.getByRole('dialog')
    expect(popover).toBeTruthy()
  })
})
