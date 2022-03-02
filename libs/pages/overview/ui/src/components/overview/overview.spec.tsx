import { renderWithRouter } from '__mocks__/utils/test-utils'

import Overview from './overview'
import { OrganizationInterface, organizationsFactoryMock } from '@console/domains/organizations'

describe('Overview', () => {
  let organizations: OrganizationInterface[]
  beforeEach(() => {
    organizations = organizationsFactoryMock(3)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<Overview organizations={organizations} />)
    expect(baseElement).toBeTruthy()
  })
})
