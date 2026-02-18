import { webhookFactoryMock } from '@qovery/shared/factories'
import * as sharedUi from '@qovery/shared/ui'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import * as useDeleteWebhookHook from '../hooks/use-delete-webhook/use-delete-webhook'
import * as useEditWebhookHook from '../hooks/use-edit-webhook/use-edit-webhook'
import * as useWebhooksHook from '../hooks/use-webhooks/use-webhooks'
import { SettingsWebhook } from './settings-webhook'
import WebhookCrudModalFeature from './webhook-crud-modal-feature/webhook-crud-modal-feature'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
}))

const useWebhooksMockSpy = jest.spyOn(useWebhooksHook, 'useWebhooks') as jest.Mock
const useEditWebhookMockSpy = jest.spyOn(useEditWebhookHook, 'useEditWebhook') as jest.Mock
const useDeleteWebhookMockSpy = jest.spyOn(useDeleteWebhookHook, 'useDeleteWebhook') as jest.Mock
const useModalMockSpy = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const useModalConfirmationMockSpy = jest.spyOn(sharedUi, 'useModalConfirmation') as jest.Mock

describe('SettingsWebhook', () => {
  let openModalMock: jest.Mock
  let closeModalMock: jest.Mock
  let openModalConfirmationMock: jest.Mock
  let editWebhookMock: jest.Mock
  let deleteWebhookMock: jest.Mock

  const mockWebhooks = webhookFactoryMock(3)

  beforeEach(() => {
    openModalMock = jest.fn()
    closeModalMock = jest.fn()
    openModalConfirmationMock = jest.fn()
    editWebhookMock = jest.fn().mockResolvedValue(undefined)
    deleteWebhookMock = jest.fn().mockResolvedValue(undefined)

    useModalMockSpy.mockReturnValue({
      openModal: openModalMock,
      closeModal: closeModalMock,
      enableAlertClickOutside: jest.fn(),
    })
    useModalConfirmationMockSpy.mockReturnValue({
      openModalConfirmation: openModalConfirmationMock,
    })
    useWebhooksMockSpy.mockReturnValue({
      data: mockWebhooks,
      isLoading: false,
    })
    useEditWebhookMockSpy.mockReturnValue({
      mutateAsync: editWebhookMock,
    })
    useDeleteWebhookMockSpy.mockReturnValue({
      mutateAsync: deleteWebhookMock,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsWebhook />)
    expect(baseElement).toBeTruthy()
  })

  it('should render webhooks with actions', () => {
    renderWithProviders(<SettingsWebhook />)

    expect(useWebhooksMockSpy).toHaveBeenCalledWith({ organizationId: '1', suspense: true })

    const rows = screen.getAllByTestId('webhook-row')
    expect(rows).toHaveLength(3)

    if (mockWebhooks[0].target_url) within(rows[0]).getByText(mockWebhooks[0].target_url)
    within(rows[0]).getByTestId('edit-webhook')
    within(rows[0]).getByTestId('input-toggle')
    within(rows[0]).getByTestId('delete-webhook')
  })

  it('should open create modal on click on add new', async () => {
    const { userEvent } = renderWithProviders(<SettingsWebhook />)

    await userEvent.click(screen.getByRole('button', { name: 'Add new' }))

    expect(openModalMock).toHaveBeenCalled()

    const modalProps = openModalMock.mock.calls[0][0]
    expect(modalProps.content.type).toBe(WebhookCrudModalFeature)
    expect(modalProps.content.props.organizationId).toBe('1')
    expect(modalProps.content.props.webhook).toBeUndefined()
  })

  it('should open edit modal on click on cog', async () => {
    const { userEvent } = renderWithProviders(<SettingsWebhook />)

    await userEvent.click(screen.getAllByTestId('edit-webhook')[0])

    expect(openModalMock).toHaveBeenCalled()

    const modalProps = openModalMock.mock.calls[0][0]
    expect(modalProps.content.type).toBe(WebhookCrudModalFeature)
    expect(modalProps.content.props.webhook).toEqual(mockWebhooks[0])
  })

  it('should toggle a webhook', async () => {
    const { userEvent } = renderWithProviders(<SettingsWebhook />)

    const rows = screen.getAllByTestId('webhook-row')
    const toggle = within(rows[0]).getByTestId('input-toggle-button')

    await userEvent.click(toggle)

    expect(editWebhookMock).toHaveBeenCalledWith({
      organizationId: '1',
      webhookId: mockWebhooks[0].id,
      webhookRequest: {
        ...mockWebhooks[0],
        enabled: true,
      },
    })
    expect(closeModalMock).toHaveBeenCalled()
  })

  it('should display empty placeholder', () => {
    useWebhooksMockSpy.mockReturnValue({
      data: [],
    })

    renderWithProviders(<SettingsWebhook />)

    expect(useWebhooksMockSpy).toHaveBeenCalledWith({ organizationId: '1', suspense: true })

    screen.getByTestId('empty-webhook')
  })

  it('should call delete action from confirmation modal', async () => {
    const { userEvent } = renderWithProviders(<SettingsWebhook />)

    await userEvent.click(screen.getAllByTestId('delete-webhook')[0])

    expect(openModalConfirmationMock).toHaveBeenCalled()

    const modalProps = openModalConfirmationMock.mock.calls[0][0]
    modalProps.action()

    expect(deleteWebhookMock).toHaveBeenCalledWith({
      organizationId: '1',
      webhookId: mockWebhooks[0].id,
    })
  })
})
