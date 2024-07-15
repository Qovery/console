import { render } from '__tests__/utils/setup-jest'
import PlaceholderNoRules, { type PlaceholderNoRulesProps } from './placeholder-no-rules'

describe('PlaceholderNoRules', () => {
  const props: PlaceholderNoRulesProps = {
    organizationId: '123',
    linkNewRule: '/general',
    clusterAvailable: true,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PlaceholderNoRules {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
