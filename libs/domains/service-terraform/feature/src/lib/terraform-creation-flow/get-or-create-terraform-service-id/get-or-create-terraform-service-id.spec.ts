import { getOrCreateTerraformServiceId } from './get-or-create-terraform-service-id'

describe('getOrCreateTerraformServiceId', () => {
  it('reuses the existing service when retrying the creation flow', async () => {
    const createService = jest.fn().mockResolvedValue({ id: 'service-1' })

    const createdServiceId = await getOrCreateTerraformServiceId(undefined, createService)
    const retriedServiceId = await getOrCreateTerraformServiceId(createdServiceId, createService)

    expect(createdServiceId).toBe('service-1')
    expect(retriedServiceId).toBe('service-1')
    expect(createService).toHaveBeenCalledTimes(1)
  })
})
