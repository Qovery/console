import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { act, fireEvent, getAllByTestId, getByLabelText, getByTestId } from '__tests__/utils/setup-jest'
import { render } from '__tests__/utils/setup-jest'
import { OrganizationWebhookResponse } from 'qovery-typescript-axios'
import * as organizationDomain from '@qovery/domains/organization'
import { webhookFactoryMock } from '@qovery/shared/factories'
import PageOrganizationWebhooksFeature from './page-organization-webhooks-feature'

const useFetchWebhooksMockSpy = jest.spyOn(organizationDomain, 'useFetchWebhooks') as jest.Mock
const useEditWebhooksMockSpy = jest.spyOn(organizationDomain, 'useEditWebhook') as jest.Mock

const mockWebhooks = webhookFactoryMock(3)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageOrganizationWebhooksFeature', () => {
  beforeEach(() => {
    useFetchWebhooksMockSpy.mockReturnValue(mockUseQueryResult<OrganizationWebhookResponse[]>(mockWebhooks))
    useEditWebhooksMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationWebhooksFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 3 rows', () => {
    const { baseElement } = render(<PageOrganizationWebhooksFeature />)
    const rows = getAllByTestId(baseElement, 'webhook-row')
    expect(rows).toHaveLength(3)
  })

  it('should render empty placeholder', () => {
    useFetchWebhooksMockSpy.mockReturnValue(mockUseQueryResult<OrganizationWebhookResponse[]>([]))
    const { baseElement } = render(<PageOrganizationWebhooksFeature />)
    getByTestId(baseElement, 'empty-webhook')
  })

  it('should render pass the toggle to true', async () => {
    const { baseElement } = render(<PageOrganizationWebhooksFeature />)
    const toggles = getAllByTestId(baseElement, 'input-toggle')

    await act(() => {
      const input = getByLabelText(toggles[0], 'toggle-btn')
      if (input) fireEvent.click(input)
    })

    expect(useEditWebhooksMockSpy().mutate).toHaveBeenCalledWith({
      organizationId: '1',
      webhookId: mockWebhooks[0].id,
      data: {
        ...mockWebhooks[0],
        enabled: true,
      },
    })
  })
})
