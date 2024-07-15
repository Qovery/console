import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsStorageFeature from './page-settings-storage-feature'

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockApplication,
  }),
  useEditService: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
  useDeploymentStatus: () => ({
    data: {
      state: 'READY',
    },
    isLoading: false,
  }),
}))

describe('PageSettingsStorageFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<PageSettingsStorageFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should create keys if service exists', async () => {
    renderWithProviders(<PageSettingsStorageFeature />)

    const row = await screen.findByTestId('form-row')
    expect(row).toBeInTheDocument()
  })
})
