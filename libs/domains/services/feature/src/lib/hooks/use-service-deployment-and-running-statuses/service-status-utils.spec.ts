import { type Status } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { getServiceListStatus, getServiceRunningStatus } from './service-status-utils'

const managedDatabase = {
  id: 'database-id',
  service_type: 'DATABASE',
  serviceType: 'DATABASE',
  mode: 'MANAGED',
} as AnyService

const createDeploymentStatus = (overrides: Partial<Status> = {}) =>
  ({
    id: 'database-id',
    state: 'READY',
    service_deployment_status: 'UP_TO_DATE',
    is_part_last_deployment: false,
    status_details: {
      action: 'DEPLOY',
      status: 'SUCCESS',
      sub_action: 'NONE',
    },
    deployment_request_id: null,
    deployment_requests_count: 0,
    ...overrides,
  }) as Status

describe('service status utils', () => {
  it('keeps skipped managed databases with previous deployment metadata displayed as running', () => {
    const runningStatus = getServiceRunningStatus({
      service: managedDatabase,
      deploymentStatus: createDeploymentStatus({
        last_deployment_date: '2026-05-25T07:00:00Z',
        execution_id: 'execution-id',
      }),
    })

    expect(runningStatus.state).toBe('RUNNING')
    expect(runningStatus.stateLabel).toBe('Running')
  })

  it('keeps never deployed managed databases unknown when deployment state is ready', () => {
    const runningStatus = getServiceRunningStatus({
      service: managedDatabase,
      deploymentStatus: createDeploymentStatus(),
    })

    expect(runningStatus.state).toBe('UNKNOWN')
    expect(runningStatus.stateLabel).toBe('Unknown')
  })

  it('keeps the running status as the service list status when the service is skipped', () => {
    const status = getServiceListStatus({
      ...managedDatabase,
      deploymentStatus: createDeploymentStatus({
        state: 'READY',
        last_deployment_date: '2026-05-25T07:00:00Z',
      }),
      runningStatus: {
        state: 'RUNNING',
      },
    })

    expect(status).toBe('RUNNING')
  })
})
