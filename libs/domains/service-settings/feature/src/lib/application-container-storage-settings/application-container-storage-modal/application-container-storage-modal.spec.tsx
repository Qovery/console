import { StorageTypeEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ApplicationContainerStorageModal,
  type ApplicationContainerStorageModalProps,
} from './application-container-storage-modal'

const mockEditService = jest.fn()
const mockEnableAlertClickOutside = jest.fn()
const onClose = jest.fn()

const buildApplication = () => {
  const application = applicationFactoryMock(1)[0] as Application
  application.storage = [
    {
      id: 'storage-1',
      size: 20,
      mount_point: '/data',
      type: StorageTypeEnum.FAST_SSD,
    },
  ]
  return application
}

jest.mock('@qovery/domains/services/feature', () => ({
  useEditService: () => ({
    mutateAsync: mockEditService,
    isLoading: false,
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    enableAlertClickOutside: mockEnableAlertClickOutside,
  }),
}))

describe('ApplicationContainerStorageModal', () => {
  let props: ApplicationContainerStorageModalProps

  beforeEach(() => {
    jest.clearAllMocks()
    props = {
      organizationId: 'org-1',
      projectId: 'project-1',
      onClose,
      service: buildApplication(),
    }
  })

  it('renders create mode', () => {
    renderWithProviders(<ApplicationContainerStorageModal {...props} />)

    expect(screen.getByText('Create storage')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('renders edit mode', () => {
    renderWithProviders(<ApplicationContainerStorageModal {...props} storage={props.service.storage?.[0]} />)

    expect(screen.getByText('Edit storage')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('submits a new storage', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageModal {...props} />)

    await userEvent.type(screen.getByLabelText('Mounting Path'), '/test')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: props.service.id,
      payload: expect.objectContaining({
        storage: [
          ...(props.service.storage ?? []),
          {
            mount_point: '/test',
            size: 4,
            type: StorageTypeEnum.FAST_SSD,
          },
        ],
      }),
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('submits an edited storage', async () => {
    const storage = props.service.storage?.[0]
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageModal {...props} storage={storage} />)

    await userEvent.clear(screen.getByLabelText('Mounting Path'))
    await userEvent.type(screen.getByLabelText('Mounting Path'), '/updated')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: props.service.id,
      payload: expect.objectContaining({
        storage: [
          {
            ...storage,
            mount_point: '/updated',
            size: storage?.size,
            type: storage?.type,
          },
        ],
      }),
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('updates alert click outside when the form becomes dirty', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageModal {...props} />)

    expect(mockEnableAlertClickOutside).toHaveBeenCalledWith(false)

    await userEvent.type(screen.getByLabelText('Mounting Path'), '/test')

    expect(mockEnableAlertClickOutside).toHaveBeenLastCalledWith(true)
  })
})
