import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsImageRegistryFeature } from './page-settings-image-registry-feature'

describe('SettingsImageRegistryFeature', () => {
  const props = {
    containerRegistry: {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'registry',
      description: 'description',
      kind: ContainerRegistryKindEnum.ECR,
    },
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<SettingsImageRegistryFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render fields with disabled attribute', async () => {
    renderWithProviders(<SettingsImageRegistryFeature {...props} />)

    const name = screen.getByLabelText('Registry name')
    screen.getByDisplayValue('registry')
    expect(name).toBeDisabled()

    const description = screen.getByLabelText('Description')
    expect(description).toBeDisabled()
    screen.getByDisplayValue('description')

    const type = screen.getByLabelText('Type')
    expect(type).toBeDisabled()
  })
})
