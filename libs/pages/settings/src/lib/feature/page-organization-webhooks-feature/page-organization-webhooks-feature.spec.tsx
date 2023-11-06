import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationWebhooksFeature from './page-organization-webhooks-feature'

const useWebhooksMockSpy = jest.spyOn(organizationsDomain, 'useWebhooks') as jest.Mock
const useEditWebhooksMockSpy = jest.spyOn(organizationsDomain, 'useEditWebhook') as jest.Mock

const mockWebhooks = webhookFactoryMock(1)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageOrganizationWebhooksFeature', () => {
  beforeEach(() => {
    useWebhooksMockSpy.mockReturnValue({
      data: mockWebhooks,
    })
    useEditWebhooksMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationWebhooksFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 1 row', () => {
    renderWithProviders(<PageOrganizationWebhooksFeature />)
    const rows = screen.getAllByTestId('webhook-row')
    expect(rows).toHaveLength(1)
  })

  it('should render empty placeholder', () => {
    useWebhooksMockSpy.mockReturnValue({
      data: [],
    })
    renderWithProviders(<PageOrganizationWebhooksFeature />)
    screen.getByTestId('empty-webhook')
  })

  it('should render pass the toggle to true', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationWebhooksFeature />)

    const input = screen.getByTestId('input-toggle-button')
    await userEvent.click(input)

    expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '1',
      webhookId: mockWebhooks[0].id,
      webhookRequest: {
        ...mockWebhooks[0],
        enabled: true,
      },
    })
  })
})
