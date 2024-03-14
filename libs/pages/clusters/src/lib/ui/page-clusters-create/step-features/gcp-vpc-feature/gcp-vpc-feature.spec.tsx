import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GCPVpcFeature } from './gcp-vpc-feature'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GCPVpcFeature />))
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshots', async () => {
    const { baseElement, userEvent } = renderWithProviders(wrapWithReactHookForm(<GCPVpcFeature />))
    await userEvent.click(screen.getByText(/set additional ranges/i))

    expect(baseElement).toMatchSnapshot()
  })
})
