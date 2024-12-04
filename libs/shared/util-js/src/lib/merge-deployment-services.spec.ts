import { type DeploymentHistoryEnvironment, type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { type DeploymentService } from '@qovery/shared/interfaces'
import { mergeDeploymentServices, mergeDeploymentServicesLegacy } from './merge-deployment-services'

describe('mergeDeploymentServices', () => {
  it('should correctly merge and transform services from deployment history', () => {
    const mockDeploymentHistory = [
      {
        identifier: {
          execution_id: 'exec-1',
          environment_id: 'env-1',
        },
        stages: [
          {
            name: 'test',
            status: 'ONGOING',
            duration: '',
            services: [
              {
                identifier: {
                  name: 'service',
                  service_type: 'APPLICATION',
                  service_id: 'app-1',
                },
                status: 'BUILDING',
                auditing_data: {
                  created_at: '',
                  updated_at: '',
                  triggered_by: '',
                },
                details: {},
              },
              {
                identifier: {
                  name: 'container',
                  service_type: 'CONTAINER',
                  service_id: 'container-1',
                },
                status: 'BUILDING',
                auditing_data: {
                  created_at: '',
                  updated_at: '',
                  triggered_by: '',
                },
                details: {},
              },
            ],
          },
        ],
        auditing_data: {},
        status: 'BUILDING',
        trigger_action: 'DEPLOY',
        total_duration: '',
      },
      {
        identifier: {
          execution_id: 'exec-2',
          environment_id: 'env-1',
        },
        stages: [
          {
            name: '',
            status: 'ONGOING',
            duration: '',
            services: [
              {
                identifier: {
                  name: 'database',
                  service_type: 'DATABASE',
                  service_id: 'db-1',
                },
                status: 'BUILDING',
                auditing_data: {
                  created_at: '',
                  updated_at: '',
                  triggered_by: '',
                },
                details: {},
              },
            ],
          },
        ],
        auditing_data: {},
        status: 'BUILDING',
        trigger_action: 'DEPLOY',
        total_duration: '',
      },
    ] as DeploymentHistoryEnvironmentV2[]

    const expectedResult = [
      {
        identifier: {
          name: 'service',
          service_type: 'APPLICATION',
          service_id: 'app-1',
        },
        status: 'BUILDING',
        execution_id: 'exec-1',
        type: 'APPLICATION',
        auditing_data: {
          created_at: '',
          triggered_by: '',
          updated_at: '',
        },
        details: {},
      },
      {
        identifier: {
          name: 'container',
          service_type: 'CONTAINER',
          service_id: 'container-1',
        },
        status: 'BUILDING',
        execution_id: 'exec-1',
        type: 'CONTAINER',
        auditing_data: {
          created_at: '',
          triggered_by: '',
          updated_at: '',
        },
        details: {},
      },
      {
        identifier: {
          name: 'database',
          service_type: 'DATABASE',
          service_id: 'db-1',
        },
        status: 'BUILDING',
        execution_id: 'exec-2',
        type: 'DATABASE',
        auditing_data: {
          created_at: '',
          triggered_by: '',
          updated_at: '',
        },
        details: {},
      },
    ] as DeploymentService[]

    expect(mergeDeploymentServices(mockDeploymentHistory)).toEqual(expectedResult)
  })
})

describe('mergeDeploymentServicesLegacy', () => {
  it('should merge deployment services correctly and sort by id', () => {
    const deploymentHistory = [
      {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        applications: [{ id: 'app1', name: 'Application 1' }],
        containers: [{ id: 'container1', name: 'Container 1' }],
        databases: [{ id: 'db1', name: 'Database 1' }],
        jobs: [
          { id: 'job1', name: 'Job 1' },
          { id: 'job2', name: 'Job 2' },
        ],
        helms: [
          { id: 'helm1', name: 'Helm 1' },
          { id: 'helm2', name: 'Helm 2' },
        ],
      },
      {
        id: '2',
        created_at: '2023-01-02T00:00:00Z',
        applications: [{ id: 'app2', name: 'Application 2' }],
        containers: [],
        databases: [],
        jobs: [],
        helms: [],
      },
    ]

    const expectedOutput = [
      {
        id: 'app1',
        name: 'Application 1',
        execution_id: '1',
        type: 'APPLICATION',
      },
      {
        id: 'container1',
        name: 'Container 1',
        execution_id: '1',
        type: 'CONTAINER',
      },
      {
        id: 'db1',
        name: 'Database 1',
        execution_id: '1',
        type: 'DATABASE',
      },
      {
        id: 'helm1',
        name: 'Helm 1',
        execution_id: '1',
        type: 'HELM',
      },
      {
        id: 'helm2',
        name: 'Helm 2',
        execution_id: '1',
        type: 'HELM',
      },
      {
        id: 'job1',
        name: 'Job 1',
        execution_id: '1',
        type: 'LIFECYCLE_JOB',
      },
      {
        id: 'job2',
        name: 'Job 2',
        execution_id: '1',
        type: 'LIFECYCLE_JOB',
      },
      {
        id: 'app2',
        name: 'Application 2',
        execution_id: '2',
        type: 'APPLICATION',
      },
    ]

    const result = mergeDeploymentServicesLegacy(deploymentHistory as DeploymentHistoryEnvironment[])
    expect(result).toEqual(expectedOutput)
  })

  it('should return an empty array if deploymentHistory is not defined', () => {
    const result = mergeDeploymentServicesLegacy(undefined)
    expect(result).toEqual([])
  })
})
