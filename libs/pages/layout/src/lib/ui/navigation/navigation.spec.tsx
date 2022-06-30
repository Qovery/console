import { render } from '__tests__/utils/setup-jest'

import Navigation, { NavigationProps } from './navigation'

describe('Navigation', () => {
  const props: NavigationProps = {
    firstName: '',
    lastName: '',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Navigation {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
