import { type DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
import { mergeDeploymentServices } from './merge-deployment-services'

describe('mergeDeploymentServices', () => {
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

    const result = mergeDeploymentServices(deploymentHistory as DeploymentHistoryEnvironment[])
    expect(result).toEqual(expectedOutput)
  })

  it('should return an empty array if deploymentHistory is not defined', () => {
    const result = mergeDeploymentServices(undefined)
    expect(result).toEqual([])
  })
})
