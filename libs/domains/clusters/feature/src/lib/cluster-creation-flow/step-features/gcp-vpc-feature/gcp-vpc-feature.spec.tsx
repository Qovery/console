import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GCPVpcFeature } from './gcp-vpc-feature'

describe('GCPVpcFeature', () => {
  it('should render base fields', () => {
    renderWithProviders(wrapWithReactHookForm(<GCPVpcFeature />))

    expect(screen.getByText('Deploy on an existing VPC')).toBeInTheDocument()
    expect(screen.getByLabelText('VPC Name')).toBeInTheDocument()
    expect(screen.getByText('Set additional ranges')).toBeInTheDocument()
  })

  it('should show additional fields when clicking button', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<GCPVpcFeature />))

    await userEvent.click(screen.getByRole('button', { name: 'Set additional ranges' }))

    expect(screen.getByText('Additional ranges (optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Subnetwork range name (optional)')).toBeInTheDocument()
  })
})
