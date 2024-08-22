import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsDomainsFeature from './page-settings-domains-feature'

const mockApplication = applicationFactoryMock(1)[0] as Application

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockApplication,
  }),
  useCheckCustomDomains: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
}))

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useCustomDomains: () => ({
    data: [
      {
        id: '1',
        domain: 'example.com',
        status: 'VALIDATION_PENDING',
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: '2',
        domain: 'example2.com',
        status: 'VALIDATION_PENDING',
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ],
  }),
  useDeleteCustomDomain: () => ({
    mutate: jest.fn(),
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationId: '1' }),
}))

const mockOpenModal = jest.fn()
const mockOpenConfirmationModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenConfirmationModal,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationId: '1' }),
}))

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })

  describe('with an application defined', () => {
    it('should dispatch open modal if click on edit', async () => {
      const { userEvent } = renderWithProviders(<PageSettingsDomainsFeature />)

      const editButton = screen.getAllByTestId('edit-button')[0]
      await userEvent.click(editButton)

      expect(mockOpenModal).toHaveBeenCalled()
    })

    it('should dispatch open confirmation modal if click on delete', async () => {
      const { userEvent } = renderWithProviders(<PageSettingsDomainsFeature />)

      const deleteButton = screen.getAllByTestId('delete-button')[0]
      await userEvent.click(deleteButton)

      expect(mockOpenConfirmationModal).toHaveBeenCalled()
    })
  })
})
