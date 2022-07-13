import { render } from '@testing-library/react'

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
