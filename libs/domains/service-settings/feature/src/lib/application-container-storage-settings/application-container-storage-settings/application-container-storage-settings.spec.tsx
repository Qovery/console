import { StorageTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { type Database } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, containerFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerStorageSettings } from './application-container-storage-settings'

const mockEditService = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

const buildApplication = () => {
  const application = applicationFactoryMock(1)[0]
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

const buildContainer = () => {
  const container = containerFactoryMock(1)[0]
  container.storage = [
    {
      id: 'storage-1',
      size: 20,
      mount_point: '/data',
      type: StorageTypeEnum.FAST_SSD,
    },
  ]
  return container
}

let mockService = buildApplication()
let mockDeploymentStatus: { state: string } | undefined = { state: 'READY' }

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'project-1',
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockService,
  }),
  useDeploymentStatus: () => ({
    data: mockDeploymentStatus,
  }),
  useEditService: () => ({
    mutate: mockEditService,
  }),
}))

jest.mock('../application-container-storage-modal/application-container-storage-modal', () => ({
  ApplicationContainerStorageModal: ({ storage }: { storage?: { mount_point: string } }) => (
    <div data-testid="application-container-storage-modal">{storage?.mount_point ?? 'new-storage'}</div>
  ),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

describe('ApplicationContainerStorageSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockService = buildApplication()
    mockDeploymentStatus = { state: 'READY' }
  })

  it('renders for application services', () => {
    renderWithProviders(<ApplicationContainerStorageSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Storage' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
    expect(screen.getByDisplayValue('/data')).toBeInTheDocument()
  })

  it('renders for container services', () => {
    mockService = buildContainer()

    renderWithProviders(<ApplicationContainerStorageSettings />)

    expect(screen.getByRole('heading', { level: 1, name: 'Storage' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('/data')).toBeInTheDocument()
  })

  it('does not render for unsupported service types', () => {
    mockService = databaseFactoryMock(1)[0] as Database

    renderWithProviders(<ApplicationContainerStorageSettings />)

    expect(screen.queryByText('Storage')).not.toBeInTheDocument()
  })

  it('shows the empty state when no storage exists', () => {
    mockService = {
      ...buildApplication(),
      storage: [],
    }

    renderWithProviders(<ApplicationContainerStorageSettings />)

    expect(screen.getByText('No storage are set')).toBeInTheDocument()
  })

  it('opens the add modal', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageSettings />)

    await userEvent.click(screen.getByRole('button', { name: /add storage/i }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the edit modal', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageSettings />)

    await userEvent.click(screen.getByTestId('edit-button'))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })

  it('opens the delete confirmation and removes the storage', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerStorageSettings />)

    await userEvent.click(screen.getByTestId('delete-button'))

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)

    mockOpenModalConfirmation.mock.calls[0][0].action()

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: mockService.id,
      payload: expect.objectContaining({
        storage: [],
      }),
    })
  })

  it('disables add storage when deployment is not ready', () => {
    mockDeploymentStatus = { state: 'DEPLOYED' }

    renderWithProviders(<ApplicationContainerStorageSettings />)

    expect(screen.getByRole('button', { name: /add storage/i })).toBeDisabled()
  })
})
