import { projectsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentList, type EnvironmentListProps } from './environment-list'

jest.mock('../hooks/use-environments/use-environments', () => ({
  useEnvironments: () => ({
    data: [
      {
        id: '893c68cb-d1f7-498b-9e00-be841c8d38c3',
        created_at: '2024-01-23T10:40:24.421127Z',
        updated_at: '2024-01-23T10:40:24.421129Z',
        name: 'gcp',
        organization: {
          id: '3d542888-3d2c-474a-b1ad-712556db66da',
        },
        project: {
          id: 'a021261e-4318-4f2f-b480-169ab62efc28',
        },
        cloud_provider: {
          provider: 'GCP',
          cluster: 'europe-west9',
        },
        mode: 'DEVELOPMENT',
        cluster_id: '28480911-95f9-48c9-8e58-2685dbfc9004',
        cluster_name: 'GCP cluster',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '893c68cb-d1f7-498b-9e00-be841c8d38c3',
          state: 'READY',
          last_deployment_date: null,
          last_deployment_state: 'READY',
          last_deployment_id: '893c68cb-d1f7-498b-9e00-be841c8d38c3-null',
          total_deployment_duration_in_seconds: null,
          metrics: null,
          origin: null,
          triggered_by: null,
          stateLabel: 'Never deployed',
        },
      },
      {
        id: '2fe51760-af0b-4f2f-b752-88a813e1375d',
        created_at: '2023-07-19T07:56:19.802175Z',
        updated_at: '2023-07-19T12:16:41.617373Z',
        name: 'my-prod-env',
        organization: {
          id: '3d542888-3d2c-474a-b1ad-712556db66da',
        },
        project: {
          id: 'a021261e-4318-4f2f-b480-169ab62efc28',
        },
        cloud_provider: {
          provider: 'AWS',
          cluster: 'eu-west-3',
        },
        mode: 'PRODUCTION',
        cluster_id: 'c531a994-603f-4edf-86cd-bdaea66a46a9',
        cluster_name: 'Undeletable_cluster',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '2fe51760-af0b-4f2f-b752-88a813e1375d',
          state: 'CANCELED',
          last_deployment_date: '2023-10-11T07:28:37.522688Z',
          last_deployment_state: 'CANCELED',
          last_deployment_id: '2fe51760-af0b-4f2f-b752-88a813e1375d-20',
          total_deployment_duration_in_seconds: -7240316,
          metrics: [
            {
              stage_id: 'ea0705e3-09e2-479f-9c42-fdbe0c1b5187',
              total_duration_sec: 383,
              details: [
                {
                  stage_id: 'ea0705e3-09e2-479f-9c42-fdbe0c1b5187',
                  step_name: 'QUEUEING',
                  status: 'SUCCESS',
                  duration_sec: 4,
                },
                {
                  stage_id: 'ea0705e3-09e2-479f-9c42-fdbe0c1b5187',
                  step_name: 'PROVISION_BUILDER',
                  status: 'SUCCESS',
                  duration_sec: 1,
                },
              ],
            },
          ],
          origin: null,
          triggered_by: '',
          stateLabel: 'Canceled',
        },
      },
      {
        id: '0cd5d05e-0839-48ff-be67-ca3f4fcf8250',
        created_at: '2023-07-17T09:02:33.880667Z',
        updated_at: '2023-07-19T12:16:53.170511Z',
        name: 'my-dev-env',
        organization: {
          id: '3d542888-3d2c-474a-b1ad-712556db66da',
        },
        project: {
          id: 'a021261e-4318-4f2f-b480-169ab62efc28',
        },
        cloud_provider: {
          provider: 'AWS',
          cluster: 'eu-west-3',
        },
        mode: 'DEVELOPMENT',
        cluster_id: 'c531a994-603f-4edf-86cd-bdaea66a46a9',
        cluster_name: 'Undeletable_cluster',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '0cd5d05e-0839-48ff-be67-ca3f4fcf8250',
          state: 'CANCELED',
          last_deployment_date: '2024-01-25T16:42:22.493828Z',
          last_deployment_state: 'CANCELED',
          last_deployment_id: '0cd5d05e-0839-48ff-be67-ca3f4fcf8250-37',
          total_deployment_duration_in_seconds: -16431930,
          metrics: [
            {
              stage_id: '7d81300b-a68a-4194-b3e1-c070c1594e23',
              total_duration_sec: 29,
              details: [
                {
                  stage_id: '7d81300b-a68a-4194-b3e1-c070c1594e23',
                  step_name: 'QUEUEING',
                  status: 'SUCCESS',
                  duration_sec: 4,
                },
                {
                  stage_id: '7d81300b-a68a-4194-b3e1-c070c1594e23',
                  step_name: 'PROVISION_BUILDER',
                  status: 'SUCCESS',
                  duration_sec: 1,
                },
              ],
            },
          ],
          origin: 'API',
          triggered_by: 'Qovery (Camille TJHOA)',
          stateLabel: 'Canceled',
        },
      },
      {
        id: 'c1567d73-b9cd-4664-8aa0-5c71e2bfd74a',
        created_at: '2023-10-13T10:01:35.262815Z',
        updated_at: '2023-10-13T10:01:35.262817Z',
        name: 'fgsdfg-sdfg-sdfg',
        organization: {
          id: '3d542888-3d2c-474a-b1ad-712556db66da',
        },
        project: {
          id: 'a021261e-4318-4f2f-b480-169ab62efc28',
        },
        cloud_provider: {
          provider: 'AWS',
          cluster: 'eu-west-3',
        },
        mode: 'DEVELOPMENT',
        cluster_id: 'c531a994-603f-4edf-86cd-bdaea66a46a9',
        cluster_name: 'Undeletable_cluster',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: 'c1567d73-b9cd-4664-8aa0-5c71e2bfd74a',
          state: 'DEPLOYED',
          last_deployment_date: '2024-01-12T08:32:03.309776Z',
          last_deployment_state: 'DEPLOYED',
          last_deployment_id: 'c1567d73-b9cd-4664-8aa0-5c71e2bfd74a-4',
          total_deployment_duration_in_seconds: -7857029,
          metrics: [
            {
              stage_id: '6432f8f2-f718-4a9e-9177-878f350491ac',
              total_duration_sec: 13,
              details: [
                {
                  stage_id: '6432f8f2-f718-4a9e-9177-878f350491ac',
                  step_name: 'QUEUEING',
                  status: 'SUCCESS',
                  duration_sec: 4,
                },
              ],
            },
          ],
          origin: 'API',
          triggered_by: 'Qovery (Camille TJHOA)',
          stateLabel: 'Deployed',
        },
      },
    ],
  }),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockProject = projectsFactoryMock(1)[0]

const environmentListProps: EnvironmentListProps = {
  project: mockProject,
  clusterAvailable: true,
}

describe('EnvironmentList', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EnvironmentList {...environmentListProps} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const now = new Date('2023-11-13T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(now)
    const { container } = renderWithProviders(<EnvironmentList {...environmentListProps} />)
    expect(container).toMatchSnapshot()
    jest.useRealTimers()
  })
  it('should display all environments', () => {
    renderWithProviders(<EnvironmentList {...environmentListProps} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(5)
  })
  it('should filter environments by mode', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentList {...environmentListProps} />)
    await userEvent.click(screen.getAllByRole('button', { name: /environment/i })[0])
    await userEvent.click(screen.getByRole('menuitem', { name: /production/i }))
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
  })
  it('should navigate to environment on row click', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentList {...environmentListProps} />)
    const rows = screen.getAllByRole('row')
    await userEvent.click(rows[1])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/3d542888-3d2c-474a-b1ad-712556db66da/project/a021261e-4318-4f2f-b480-169ab62efc28/environment/893c68cb-d1f7-498b-9e00-be841c8d38c3/services/general'
    )
  })
  it('should navigate to environment live logs on environment status click', () => {
    renderWithProviders(<EnvironmentList {...environmentListProps} />)
    expect(screen.getAllByRole('link', { name: /stopped/i })[0]).toHaveAttribute(
      'href',
      '/organization/3d542888-3d2c-474a-b1ad-712556db66da/project/a021261e-4318-4f2f-b480-169ab62efc28/environment/893c68cb-d1f7-498b-9e00-be841c8d38c3/services/general'
    )
  })
  it('should navigate to environment deployment logs on environment deployment status click', () => {
    renderWithProviders(<EnvironmentList {...environmentListProps} />)
    expect(screen.getAllByRole('link', { name: /deployed/i })[1]).toHaveAttribute(
      'href',
      '/organization/3d542888-3d2c-474a-b1ad-712556db66da/project/a021261e-4318-4f2f-b480-169ab62efc28/environment/c1567d73-b9cd-4664-8aa0-5c71e2bfd74a/logs'
    )
  })
})
