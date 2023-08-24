import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  applicationFactoryMock,
  environmentFactoryMock,
  organizationFactoryMock,
  projectsFactoryMock,
} from '@qovery/shared/factories'
import { BreadcrumbMemo, type BreadcrumbProps } from './breadcrumb'

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
