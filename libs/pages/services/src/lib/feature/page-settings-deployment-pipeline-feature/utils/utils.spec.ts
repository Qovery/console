import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { move, reorderService } from './utils'

describe('PageSettingsDeploymentPipeline/utils', () => {
  it('should reorder the services within a stage', () => {
    const stages: DeploymentStageResponse[] = [
      {
        id: '1',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [
          { id: '1', created_at: '', service_id: '1' },
          { id: '2', created_at: '', service_id: '2' },
          { id: '3', created_at: '', service_id: '3' },
        ],
      },
      {
        id: '2',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [{ id: '4', created_at: '', service_id: '4' }],
      },
    ]

    const expectedStages: DeploymentStageResponse[] = [
      {
        id: '1',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [
          { id: '2', created_at: '', service_id: '2' },
          { id: '1', created_at: '', service_id: '1' },
          { id: '3', created_at: '', service_id: '3' },
        ],
      },
      {
        id: '2',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [{ id: '4', created_at: '', service_id: '4' }],
      },
    ]
    const destinationIndex = 0
    const startIndex = 1
    const endIndex = 0

    const result = reorderService(stages, destinationIndex, startIndex, endIndex)

    expect(result).toEqual(expectedStages)
  })

  it('should move a service between stages', () => {
    const stages: DeploymentStageResponse[] = [
      {
        id: '1',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [
          { id: '1', created_at: '', service_id: '1' },
          { id: '2', created_at: '', service_id: '2' },
        ],
      },
      {
        id: '2',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [{ id: '3', created_at: '', service_id: '3' }],
      },
    ]
    const droppableSource = { droppableId: '0', index: 1 }
    const droppableDestination = { droppableId: '1', index: 0 }
    const expectedStages = [
      {
        id: '1',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [{ id: '1', created_at: '', service_id: '1' }],
      },
      {
        id: '2',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [
          { id: '2', created_at: '', service_id: '2' },
          { id: '3', created_at: '', service_id: '3' },
        ],
      },
    ]

    const result = move(stages, droppableSource, droppableDestination)

    expect(result).toEqual(expectedStages)
  })

  it('should return undefined if the source or destination stage does not exist', () => {
    const stages: DeploymentStageResponse[] = [
      {
        id: '1',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [
          { id: '1', created_at: '', service_id: '1' },
          { id: '2', created_at: '', service_id: '2' },
        ],
      },
      {
        id: '2',
        created_at: '',
        environment: {
          id: '1',
        },
        services: [{ id: '3', created_at: '', service_id: '3' }],
      },
    ]
    const droppableSource = { droppableId: '0', index: 1 }
    const droppableDestination = { droppableId: '3', index: 0 }

    const result = move(stages, droppableSource, droppableDestination)

    expect(result).toBeUndefined()
  })
})
