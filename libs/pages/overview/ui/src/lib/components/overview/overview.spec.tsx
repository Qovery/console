import { render } from '__tests__/utils/setup-jest'

import Overview, { OverviewInterface } from './overview'
import { organizationFactoryMock } from '@console/domains/organization'
import { userSignUpFactoryMock } from '@console/domains/user'

describe('Overview', () => {
  const props: OverviewInterface = {
    organization: organizationFactoryMock(3),
    authLogout: Function,
    user: userSignUpFactoryMock(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Overview {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
