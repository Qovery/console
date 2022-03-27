import { render } from '__tests__/utils/setup-jest'

import Overview from './overview'
import { OrganizationInterface, organizationsFactoryMock } from '@console/domains/organizations'

describe('Overview', () => {
  let organizations: OrganizationInterface[]
  beforeEach(() => {
    organizations = organizationsFactoryMock(3)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Overview organizations={organizations} />)
    expect(baseElement).toBeTruthy()
  })
})
