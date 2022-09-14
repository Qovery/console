import { render } from '__tests__/utils/setup-jest'
import React from 'react'
import { applicationFactoryMock } from '@qovery/domains/application'
import { environmentFactoryMock } from '@qovery/domains/environment'
import { organizationFactoryMock } from '@qovery/domains/organization'
import { projectsFactoryMock } from '@qovery/domains/projects'
import { userSignUpFactoryMock } from '@qovery/domains/user'
import LayoutPage, { LayoutPageProps } from './layout-page'

describe('LayoutPage', () => {
  let props: LayoutPageProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
      authLogout: Function,
      user: userSignUpFactoryMock(),
      organizations: organizationFactoryMock(2),
      projects: projectsFactoryMock(2),
      environments: environmentFactoryMock(2),
      applications: applicationFactoryMock(2),
      application: applicationFactoryMock(1)[0],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<LayoutPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
