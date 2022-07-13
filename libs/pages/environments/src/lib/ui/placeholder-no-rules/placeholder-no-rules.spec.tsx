import { render } from '__tests__/utils/setup-jest'

import PlaceholderNoRules, { PlaceholderNoRulesProps } from './placeholder-no-rules'

describe('PlaceholderNoRules', () => {
  const props: PlaceholderNoRulesProps = {
    linkNewRule: '/general',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PlaceholderNoRules {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
