import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationWeFeature from './page-organization-labels-annotations-feature'

const useWebhooksMockSpy = jest.spyOn(organizationsDomain, 'useWebhooks') as jest.Mock
const useEditWebhooksMockSpy = jest.spyOn(organizationsDomain, 'useEditWebhook') as jest.Mock

const mockWebhooks = webhookFactoryMock(1)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageOrganizationWeFeature', () => {
  beforeEach(() => {
    useWebhooksMockSpy.mockReturnValue({
      data: mockWebhooks,
    })
    useEditWebhooksMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationWeFeature />)
    expect(baseElement).toBeTruthy()
  })
})
