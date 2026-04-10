import { type ReactNode } from 'react'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ListPreCheckLogs } from './list-pre-check-logs'

const mockDeploymentHistory = [
  {
    identifier: {
      execution_id: 'exec-123',
    },
    status: 'DEPLOYED',
    action_status: 'SUCCESS',
    trigger_action: 'DEPLOY',
    total_duration: 'PT60M',
    stages: [
      {
        name: 'build',
        status: 'SUCCESS',
        duration: 'PT60M',
        services: [
          {
            identifier: {
              name: 'web-service',
              service_id: 'service-123',
              execution_id: 'exec-123',
              service_type: 'APPLICATION',
            },
            status_details: {
              status: 'SUCCESS',
            },
            total_duration: 'PT60M',
            auditing_data: {
              created_at: '2024-01-30T12:00:00Z',
              updated_at: '2024-01-30T12:01:00Z',
              origin: 'CONSOLE',
              triggered_by: 'User',
            },
          },
        ],
      },
    ],
    auditing_data: {
      created_at: '2024-01-30T12:00:00Z',
      updated_at: '2024-01-30T12:01:00Z',
      origin: 'CONSOLE',
      triggered_by: 'User',
    },
  },
]

jest.mock('@qovery/domains/environments/feature', () => ({
  ...jest.requireActual('@qovery/domains/environments/feature'),
  useDeploymentHistory: () => ({
    data: mockDeploymentHistory,
    isFetched: true,
  }),
}))

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

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
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
