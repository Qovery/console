import { terraformFactoryMock } from '@qovery/shared/factories'
import { hasTerraformVariablesTab } from './service-variables-utils'

describe('hasTerraformVariablesTab', () => {
  it('hides the Terraform variables tab for blueprint services', () => {
    const blueprintService = { ...terraformFactoryMock(1)[0], blueprint_id: 'blueprint-id' }

    expect(hasTerraformVariablesTab(blueprintService)).toBe(false)
  })

  it('shows the Terraform variables tab for regular Terraform services', () => {
    expect(hasTerraformVariablesTab(terraformFactoryMock(1)[0])).toBe(true)
  })
})
