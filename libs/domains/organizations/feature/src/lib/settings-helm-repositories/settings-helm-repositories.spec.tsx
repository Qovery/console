import { helmRepositoriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageOrganizationHelmRepositories, SettingsHelmRepositories } from './settings-helm-repositories'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockHelmRepositories = helmRepositoriesMock(2)

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
}))

jest.mock('../hooks/use-helm-repositories/use-helm-repositories', () => ({
  useHelmRepositories: () => ({
    data: mockHelmRepositories,
  }),
}))

jest.mock('../hooks/use-delete-helm-repository/use-delete-helm-repository', () => ({
  useDeleteHelmRepository: () => ({
    mutateAsync: jest.fn(),
  }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

describe('SettingsHelmRepositories', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsHelmRepositories />)
    expect(baseElement).toBeTruthy()
  })
})

describe('PageOrganizationHelmRepositories', () => {
  const baseProps = {
    onOpenServicesAssociatedModal: jest.fn(),
    onAddRepository: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationHelmRepositories {...baseProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an empty screen', () => {
    mockHelmRepositories.splice(0, mockHelmRepositories.length)
    renderWithProviders(<PageOrganizationHelmRepositories {...baseProps} />)

    screen.getByText(/No helm repository found/i)
  })

  it('should have a list of repositories', () => {
    const repositories = helmRepositoriesMock(1)
    mockHelmRepositories.splice(0, mockHelmRepositories.length, ...repositories)
    renderWithProviders(<PageOrganizationHelmRepositories {...baseProps} />)

    screen.getByTestId(`repositories-list-${repositories[0].id}`)
  })
})
