import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import { reorder } from './utils'

const stages = deploymentStagesFactoryMock(2)

describe('Utils', () => {
  it('should have a fonction to reorder deployment group', () => {
    const deployment = reorder(stages, 0, 0, 0)
    console.log(stages)
    console.log(deployment)
    // expect(deployment).toBe([
    //   {
    //     id: '0',
    //     created_at: stages[0].created_at,
    //     updated_at: stages[0].updated_at,
    //     environment: { id: '1' },
    //     name: stages[0].name,
    //     description: stages[0].description,
    //     deployment_order: stages[0].deployment_order,
    //     services: stages[0].services,
    //   },
    // ])
  })
})
