import { render } from '__tests__/utils/setup-jest'
import Navigation, { type NavigationProps } from './navigation'

describe('Navigation', () => {
  const props: NavigationProps = {
    defaultOrganizationId: '111',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Navigation {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
