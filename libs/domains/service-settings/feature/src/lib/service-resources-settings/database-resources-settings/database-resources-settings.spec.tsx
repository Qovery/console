import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { DatabaseResourcesSettings } from './database-resources-settings'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: () => ({
    data: {
      cluster_id: 'cluster-1',
      cloud_provider: { provider: 'AWS' },
    },
  }),
}))

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: () => ({
    data: {
      cloud_provider: 'AWS',
      region: 'eu-west-3',
    },
  }),
}))

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviderDatabaseInstanceTypes: () => ({
    data: [{ name: 'db.t3.small' }],
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useEditService: () => ({ mutate: jest.fn(), isLoading: false }),
}))

describe('DatabaseResourcesSettings', () => {
  const database = {
    ...databaseFactoryMock(1)[0],
    mode: DatabaseModeEnum.MANAGED,
  }

  it('should render managed callout and form controls', async () => {
    renderWithProviders(<DatabaseResourcesSettings database={database} />)

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByText('Qovery manages this resource for you')).toBeInTheDocument()
    expect(screen.getByText('Resources configuration')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })

  it('should render instance type field for managed database', async () => {
    renderWithProviders(<DatabaseResourcesSettings database={database} />)

    expect(screen.getByLabelText('Instance type')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })
})
