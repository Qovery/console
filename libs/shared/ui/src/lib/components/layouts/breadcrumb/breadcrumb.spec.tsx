import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/domains/application'
import { environmentFactoryMock } from '@qovery/domains/environment'
import { organizationFactoryMock } from '@qovery/domains/organization'
import { projectsFactoryMock } from '@qovery/domains/projects'
import { BreadcrumbProps } from '@qovery/shared/ui'
import { BreadcrumbMemo } from './breadcrumb'

describe('Breadcrumb', () => {
  const props: BreadcrumbProps = {
    projects: projectsFactoryMock(3),
    organizations: organizationFactoryMock(3),
    environments: environmentFactoryMock(3),
    applications: applicationFactoryMock(3),
  }
  it('should render successfully', () => {
    const { baseElement } = render(<BreadcrumbMemo {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
