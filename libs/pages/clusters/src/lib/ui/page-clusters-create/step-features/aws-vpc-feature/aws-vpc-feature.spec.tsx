import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { AWSVpcFeature, areSubnetsEmpty } from './aws-vpc-feature'

describe('AwsVpcFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AWSVpcFeature />))
    expect(baseElement).toBeTruthy()
  })

  it('returns false if subnet has empty A, B, or C properties', () => {
    const subnets = [{ A: '', B: '', C: '' }]
    expect(areSubnetsEmpty(subnets)).toBe(true)
  })

  it('returns true if subnet has non-empty A, B, and C properties', () => {
    const subnets = [{ A: 'subnet1A', B: 'subnet1B', C: '' }]
    expect(areSubnetsEmpty(subnets)).toBe(false)
  })
})
