import { type DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
import { mergeDeploymentServices } from './merge-deployment-services'

describe('mergeDeploymentServices', () => {
  it('should merge deployment services correctly', () => {
    const deploymentHistory = [
      {
        id: '1',
        applications: [
          {
            id: 'app1',
            name: 'Application 1',
          },
        ],
        containers: [
          {
            id: 'container1',
            name: 'Container 1',
          },
        ],
        databases: [
          {
            id: 'db1',
            name: 'Database 1',
          },
        ],
        jobs: [
          {
            id: 'job1',
            name: 'Job 1',
          },
          {
            id: 'job2',
            name: 'Job 2',
          },
        ],
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
    ]

    const result = mergeDeploymentServices(deploymentHistory as DeploymentHistoryEnvironment[])
    expect(result).toEqual(expectedOutput)
  })

  it('should return an empty array if deploymentHistory is not defined', () => {
    const result = mergeDeploymentServices(undefined)
    expect(result).toEqual([])
  })
})
