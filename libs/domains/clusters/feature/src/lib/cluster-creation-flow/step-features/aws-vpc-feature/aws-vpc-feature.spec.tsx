import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AWSVpcFeature } from './aws-vpc-feature'

describe('AWSVpcFeature', () => {
  it('should render base VPC content', () => {
    renderWithProviders(wrapWithReactHookForm(<AWSVpcFeature />))

    expect(screen.getByText('Deploy on an existing VPC')).toBeInTheDocument()
    expect(screen.getByLabelText('VPC ID')).toBeInTheDocument()
    expect(screen.getByText('Mandatory subnet IDs')).toBeInTheDocument()
  })

  it('should open subnet popover when clicking EKS button', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<AWSVpcFeature />))

    await userEvent.click(screen.getByRole('button', { name: /EKS/i }))

    expect(screen.getByText('EKS public subnet IDs')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Confirm' }).length).toBeGreaterThan(0)
  })
})
