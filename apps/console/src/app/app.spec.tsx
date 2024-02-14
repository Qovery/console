import { type Organization } from 'qovery-typescript-axios'
import { IntercomProvider } from 'react-use-intercom'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { MyHistoryProvider } from '@qovery/shared/util-hooks'
import { renderWithProviders } from '@qovery/shared/util-tests'
import App from './app'

import SpyInstance = jest.SpyInstance

const useOrganizationsSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useOrganizations')

const mockOrganizations: Organization[] = organizationFactoryMock(1)

describe('App', () => {
  beforeEach(() => {
    useOrganizationsSpy.mockReturnValue({
      data: mockOrganizations,
    })
  })
  it('should render successfully', () => {
    window.scrollTo = jest.fn()

    const { baseElement } = renderWithProviders(
      <MyHistoryProvider>
        <IntercomProvider appId="__test__app__id__" autoBoot={false}>
          <App />
        </IntercomProvider>
      </MyHistoryProvider>
    )

    expect(baseElement).toBeTruthy()
  })
})
