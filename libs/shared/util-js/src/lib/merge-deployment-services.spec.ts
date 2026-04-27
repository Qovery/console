import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { type DeploymentService } from '@qovery/shared/interfaces'
import { mergeDeploymentServices } from './merge-deployment-services'

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
