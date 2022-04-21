import { render } from '__tests__/utils/setup-jest'

import LayoutPage, { LayoutPageProps } from './layout-page'
import React from 'react'
import { userSignUpFactoryMock } from '@console/domains/user'
import { organizationFactoryMock } from '@console/domains/organization'
import { projectsFactoryMock } from '@console/domains/projects'
import { environmentFactoryMock } from '@console/domains/environment'
import { applicationFactoryMock } from '@console/domains/application'

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
