import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ButtonPopoverSubnets from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render trigger button', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets
          sections={[
            {
              title: 'EKS subnets',
              name: 'aws_existing_vpc.eks_subnets',
            },
          ]}
        >
          EKS
        </ButtonPopoverSubnets>
      )
    )

    expect(screen.getByRole('button', { name: 'EKS' })).toBeInTheDocument()
  })

  it('should open popover content on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets
          sections={[
            {
              title: 'EKS subnets',
              name: 'aws_existing_vpc.eks_subnets',
            },
          ]}
        >
          EKS
        </ButtonPopoverSubnets>
      )
    )

    await userEvent.click(screen.getByRole('button', { name: 'EKS' }))

    expect(screen.getByText('EKS subnets')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })
})
