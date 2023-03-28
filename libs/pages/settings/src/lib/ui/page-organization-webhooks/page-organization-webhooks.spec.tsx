import { act, fireEvent, getAllByTestId, getByLabelText, getByTestId, getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { webhookFactoryMock } from '@qovery/shared/factories'
import PageOrganizationWebhooks, { PageOrganizationWebhooksProps } from './page-organization-webhooks'

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
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should open create modal on click on add new', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    const button = getByTestId(baseElement, 'add-new')

    await act(() => {
      fireEvent.click(button)
    })

    expect(props.openAddNew).toHaveBeenCalled()
  })

  it('should open edit modal on click on cog', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    const button = getAllByTestId(baseElement, 'edit-webhook')[0]

    await act(() => {
      fireEvent.click(button)
    })

    expect(props.openEdit).toHaveBeenCalledWith(mockWebhooks[0])
  })

  it('should display three rows with good values inside', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    const rows = getAllByTestId(baseElement, 'webhook-row')
    expect(rows).toHaveLength(3)

    if (mockWebhooks[0].target_url) getByText(rows[0], mockWebhooks[0].target_url)
    getByTestId(rows[0], 'edit-webhook')
    getByTestId(rows[0], 'input-toggle')
    getByTestId(rows[0], 'delete-webhook')
  })

  it('should call onToggle', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    const toggles = getAllByTestId(baseElement, 'input-toggle')

    await act(() => {
      const input = getByLabelText(toggles[0], 'toggle-btn')
      fireEvent.click(input)
    })

    expect(props.onToggle).toHaveBeenCalledWith(mockWebhooks[0].id, !mockWebhooks[0].enabled)
  })

  it('should display empty placeholder', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} webhooks={[]} />)

    getByTestId(baseElement, 'empty-webhook')
  })

  it('should call onDelete', async () => {
    const { baseElement } = render(<PageOrganizationWebhooks {...props} />)
    const rows = getAllByTestId(baseElement, 'webhook-row')

    const toggle = getByTestId(rows[0], 'delete-webhook')
    await act(() => {
      toggle.click()
    })

    expect(props.onDelete).toHaveBeenCalledWith(mockWebhooks[0])
  })
})
