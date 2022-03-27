import { render } from '__tests__/utils/setup-jest'

import Overview from './overview'
import { OrganizationInterface, organizationFactoryMock } from '@console/domains/organization'

describe('Overview', () => {
  let organization: OrganizationInterface[]
  beforeEach(() => {
    organization = organizationFactoryMock(3)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Overview organization={organization} />)
    expect(baseElement).toBeTruthy()
  })
})
