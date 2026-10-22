import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceResourcesSettings } from './service-resources-settings'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useAdvancedSettings: () => ({ data: undefined }),
  useEditAdvancedSettings: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useEditService: () => ({ mutate: jest.fn(), isLoading: false }),
  ApplicationSettingsResources: () => <div data-testid="application-settings-resources">Resources form</div>,
}))

describe('ServiceResourcesSettings', () => {
  const service = applicationFactoryMock(1)[0]

  it('should render resources heading and save action', async () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByText('Manage the resources assigned to the service.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })

  it('should render resources form content', async () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByTestId('application-settings-resources')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })
})
