import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ListPreCheckLogs } from './list-pre-check-logs'

jest.mock('../hooks/use-pre-check-logs/use-pre-check-logs', () => {
  return {
    ...jest.requireActual('../hooks/use-pre-check-logs/use-pre-check-logs'),
    usePreCheckLogs: () => ({
      data: [
        {
          id: '1',
          timestamp: '2023-01-01T00:00:00Z',
          message: { safe_message: 'Log 1' },
          details: { stage: { step: 'PreCheck' } },
        },
        {
          id: '2',
          timestamp: '2023-01-01T00:01:00Z',
          message: { safe_message: 'Log 2' },
          details: { stage: { step: 'PreCheck' } },
        },
      ],
    }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: '0',
    projectId: '1',
    environmentId: '2',
    serviceId: '3',
    versionId: '4',
  }),
}))

describe('ListPreCheckLogs', () => {
  const defaultProps = {
    environment: environmentFactoryMock(1)[0],
    preCheckStage: {
      status: 'RUNNING',
      start_time: '2023-01-01T00:00:00Z',
    },
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ListPreCheckLogs {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display logs', async () => {
    renderWithProviders(<ListPreCheckLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Log 1')).toBeInTheDocument()
      expect(screen.getByText('Log 2')).toBeInTheDocument()
    })
  })
})
