import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import PageOrganizationWebhooks, { type PageOrganizationWebhooksProps } from './page-organization-webhooks'

const mockWebhooks = webhookFactoryMock(3)
const props: PageOrganizationWebhooksProps = {
  openEdit: jest.fn(),
  onToggle: jest.fn(),
  webhooks: mockWebhooks,
  webhookLoading: false,
  openAddNew: jest.fn(),
  onDelete: jest.fn(),
}

describe('PageOrganizationWebhooks', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationWebhooks {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should open create modal on click on add new', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationWebhooks {...props} />)
    const button = screen.getByTestId('add-new')

    await userEvent.click(button)

    expect(props.openAddNew).toHaveBeenCalled()
  })

  it('should open edit modal on click on cog', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationWebhooks {...props} />)
    const button = screen.getAllByTestId('edit-webhook')[0]

    await userEvent.click(button)

    expect(props.openEdit).toHaveBeenCalledWith(mockWebhooks[0])
  })

  it('should display three rows with good values inside', async () => {
    renderWithProviders(<PageOrganizationWebhooks {...props} />)
    const rows = screen.getAllByTestId('webhook-row')
    expect(rows).toHaveLength(3)

    if (mockWebhooks[0].target_url) within(rows[0]).getByText(mockWebhooks[0].target_url)
    within(rows[0]).getByTestId('edit-webhook')
    within(rows[0]).getByTestId('input-toggle')
    within(rows[0]).getByTestId('delete-webhook')
  })

  it('should call onToggle', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationWebhooks {...props} />)
    const toggles = screen.getAllByTestId('input-toggle')

    const input = within(toggles[0]).getByLabelText('toggle-btn')
    await userEvent.click(input)

    expect(props.onToggle).toHaveBeenCalledWith(mockWebhooks[0].id, !mockWebhooks[0].enabled)
  })

  it('should display empty placeholder', async () => {
    renderWithProviders(<PageOrganizationWebhooks {...props} webhooks={[]} />)

    screen.getByTestId('empty-webhook')
  })

  it('should call onDelete', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationWebhooks {...props} />)
    const rows = screen.getAllByTestId('webhook-row')

    const toggle = within(rows[0]).getByTestId('delete-webhook')
    await userEvent.click(toggle)

    expect(props.onDelete).toHaveBeenCalledWith(mockWebhooks[0])
  })
})
