import { renderWithProviders } from '@qovery/shared/util-tests'
import ListServiceLogs from './list-service-logs'

window.HTMLElement.prototype.scroll = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: '000',
    projectId: '111',
    environmentId: '222',
    serviceId: '333',
  }),
}))

describe('ListServiceLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ListServiceLogs
        environment={{
          id: 'env-1',
          organization: { id: 'org-1' },
          project: { id: 'proj-1' },
        }}
        serviceStatus={{
          execution_id: 'exec-1',
        }}
        cluster={{
          id: 'cluster-1',
          name: 'cluster-1',
          organization: { id: 'org-1' },
          project: { id: 'proj-1' },
          metrics_parameters: {
            enabled: true,
          },
        }}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
