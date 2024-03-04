import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GCPVpcFeature } from './gcp-vpc-feature'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GCPVpcFeature />))
    expect(baseElement).toBeTruthy()
  })
})
