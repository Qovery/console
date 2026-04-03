import { type ReactNode } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ListServiceLogs from './list-service-logs'

window.HTMLElement.prototype.scroll = jest.fn()

jest.mock('@tanstack/react-router', () => {
  const mockSearch = {}
  const mockParams = { organizationId: '000', projectId: '111', environmentId: '222', serviceId: '333' }
  return {
    ...jest.requireActual('@tanstack/react-router'),
    getRouteApi: () => ({
      useParams: () => mockParams,
      useSearch: () => mockSearch,
    }),
    useSearch: () => mockSearch,
    useNavigate: () => jest.fn(),
    useParams: () => mockParams,
    useLocation: () => ({ pathname: '/', search: '' }),
    useRouter: () => ({
      buildLocation: () => ({ href: '/' }),
    }),
    Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
      <a {...props} href={`${props.to}`}>
        {children}
      </a>
    ),
  }
})

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
