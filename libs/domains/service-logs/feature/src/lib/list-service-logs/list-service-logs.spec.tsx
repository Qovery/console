import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ListServiceLogs from './list-service-logs'

window.HTMLElement.prototype.scroll = jest.fn()

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: '000',
    projectId: '111',
    environmentId: '222',
    serviceId: '333',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({ data: mockApplication }),
  useRunningStatus: () => ({ data: { state: 'RUNNING' } }),
}))

jest.mock('../hooks/use-service-logs/use-service-logs', () => ({
  useServiceLogs: () => ({
    data: [
      {
        id: 1,
        type: 'SERVICE',
        created_at: '2023-04-01T12:00:00Z',
        message: 'Test log message',
        pod_name: 'test-pod-12345',
        container_name: 'test-container',
      },
    ],
    pauseLogs: false,
    setPauseLogs: jest.fn(),
    newMessagesAvailable: false,
    setNewMessagesAvailable: jest.fn(),
    showPreviousLogs: false,
    setShowPreviousLogs: jest.fn(),
    enabledNginx: true,
    setEnabledNginx: jest.fn(),
  }),
}))

describe('ListServiceLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ListServiceLogs clusterId="000" />)
    expect(baseElement).toMatchSnapshot()
  })
})
