import { projectsFactoryMock } from '@console/domains/projects'
import { BreadcrumbProps } from '@console/shared/ui'
import { applicationFactoryMock } from '@console/domains/application'
import { environmentFactoryMock } from '@console/domains/environment'
import { render } from '__tests__/utils/setup-jest'

import Breadcrumb from './breadcrumb'

describe('Breadcrumb', () => {
  const props: BreadcrumbProps = {
    projects: projectsFactoryMock(3),
    environments: environmentFactoryMock(3),
    applications: applicationFactoryMock(3),
  }
  it('should render successfully', () => {
    const { baseElement } = render(<Breadcrumb {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
