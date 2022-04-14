import { render } from '__tests__/utils/setup-jest'

import Overview, { OverviewInterface } from './overview'
import { projectsFactoryMock } from '@console/domains/projects'
import { userSignUpFactoryMock } from '@console/domains/user'

describe('Overview', () => {
  const props: OverviewInterface = {
    projects: projectsFactoryMock(3),
    authLogout: Function,
    user: userSignUpFactoryMock(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Overview {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
