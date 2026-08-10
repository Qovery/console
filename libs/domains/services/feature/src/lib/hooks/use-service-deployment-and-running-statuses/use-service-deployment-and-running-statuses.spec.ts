import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import {
  getAgenticWorkflowDeploymentStatus,
  getAgenticWorkflowDeployments,
} from './use-service-deployment-and-running-statuses'

describe('getAgenticWorkflowDeploymentStatus', () => {
  it('returns the latest environment deployment containing the agentic workflow', () => {
    const deploymentHistory = [
      {
        identifier: { execution_id: 'environment-execution-2', environment_id: 'environment-id' },
        stages: [
          {
            services: [
              {
                identifier: {
                  service_id: 'workflow-id',
                  service_type: 'AGENTIC_WORKFLOW',
                  name: 'Review pull requests',
                },
                auditing_data: { created_at: '2026-08-10T08:00:00Z' },
                status: 'STOPPED',
                status_details: { action: 'STOP', status: 'SUCCESS', sub_action: 'NONE' },
              },
            ],
          },
        ],
      },
      {
        identifier: { execution_id: 'environment-execution-1', environment_id: 'environment-id' },
        stages: [
          {
            services: [
              {
                identifier: {
                  service_id: 'workflow-id',
                  service_type: 'AGENTIC_WORKFLOW',
                  name: 'Review pull requests',
                },
                auditing_data: { created_at: '2026-08-09T08:00:00Z' },
                status: 'DEPLOYED',
                status_details: { action: 'DEPLOY', status: 'SUCCESS', sub_action: 'NONE' },
              },
            ],
          },
        ],
      },
    ] as DeploymentHistoryEnvironmentV2[]

    expect(getAgenticWorkflowDeploymentStatus(deploymentHistory, 'workflow-id')).toEqual(
      expect.objectContaining({
        execution_id: 'environment-execution-2',
        last_deployment_date: '2026-08-10T08:00:00Z',
        state: 'STOPPED',
      })
    )
  })

  it('returns undefined when the workflow has no deployment history', () => {
    expect(getAgenticWorkflowDeploymentStatus([], 'workflow-id')).toBeUndefined()
  })

  it('keeps the environment execution id on workflow deployment history entries', () => {
    const deploymentHistory = [
      {
        identifier: { execution_id: 'environment-execution-id', environment_id: 'environment-id' },
        stages: [
          {
            services: [
              {
                identifier: {
                  service_id: 'workflow-id',
                  service_type: 'AGENTIC_WORKFLOW',
                  name: 'Review pull requests',
                },
              },
            ],
          },
        ],
      },
    ] as DeploymentHistoryEnvironmentV2[]

    expect(getAgenticWorkflowDeployments(deploymentHistory, 'workflow-id')[0]?.identifier.execution_id).toBe(
      'environment-execution-id'
    )
  })
})
