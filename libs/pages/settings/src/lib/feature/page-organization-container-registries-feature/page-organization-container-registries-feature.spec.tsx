import { render } from '__tests__/utils/setup-jest'
import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { containerRegistriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageOrganizationContainerRegistriesFeature } from './page-organization-container-registries-feature'

let mockContainerRegistries: ContainerRegistryResponse[] = []

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useContainerRegistries: () => {
    return {
      data: mockContainerRegistries,
      isFetched: true,
    }
  },
}))

describe('PageOrganizationContainerRegistriesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationContainerRegistriesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an empty screen', () => {
    mockContainerRegistries = []
    renderWithProviders(<PageOrganizationContainerRegistriesFeature />)
    expect(screen.getByText('No container registry found. Please add one.')).toBeInTheDocument()
  })

  it('should have an list of registries', () => {
    mockContainerRegistries = containerRegistriesMock(1)
    renderWithProviders(<PageOrganizationContainerRegistriesFeature />)
    expect(screen.getByTestId(`registries-list-${mockContainerRegistries[0].id}`)).toBeInTheDocument()
  })
})
