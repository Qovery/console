import { render } from '__tests__/utils/setup-jest'
import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { containerRegistriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useContainerRegistriesHook from '../hooks/use-container-registries/use-container-registries'
import { SettingsContainerRegistries } from './settings-container-registries'

let mockContainerRegistries: ContainerRegistryResponse[] = []

const useContainerRegistriesMock = jest.spyOn(useContainerRegistriesHook, 'useContainerRegistries') as jest.Mock

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '0' }),
}))

describe('SettingsContainerRegistries', () => {
  beforeEach(() => {
    mockContainerRegistries = []
    useContainerRegistriesMock.mockImplementation(() => ({
      data: mockContainerRegistries,
    }))
  })

  it('should render successfully', () => {
    const { baseElement } = render(<SettingsContainerRegistries />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an empty screen', () => {
    mockContainerRegistries = []
    renderWithProviders(<SettingsContainerRegistries />)
    expect(screen.getByText('No container registry found. Please add one.')).toBeInTheDocument()
  })

  it('should have an list of registries', () => {
    mockContainerRegistries = containerRegistriesMock(1)
    renderWithProviders(<SettingsContainerRegistries />)
    expect(screen.getByTestId(`registries-list-${mockContainerRegistries[0].id}`)).toBeInTheDocument()
  })

  it('should hide registries linked to a cluster', () => {
    const [orgRegistry] = containerRegistriesMock(1)
    const clusterRegistry: ContainerRegistryResponse = {
      ...containerRegistriesMock(1)[0],
      id: 'cluster-registry',
      cluster: { id: '1', name: 'my-cluster' },
    }
    mockContainerRegistries = [orgRegistry, clusterRegistry]
    renderWithProviders(<SettingsContainerRegistries />)
    expect(screen.getByTestId(`registries-list-${orgRegistry.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`registries-list-${clusterRegistry.id}`)).not.toBeInTheDocument()
  })
})
