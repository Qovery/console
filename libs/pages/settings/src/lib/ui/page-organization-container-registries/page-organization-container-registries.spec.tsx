import { containerRegistriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationContainerRegistries, {
  type PageOrganizationContainerRegistriesProps,
} from './page-organization-container-registries'

describe('PageOrganizationContainerRegistries', () => {
  const props: PageOrganizationContainerRegistriesProps = {
    onAddRegistry: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    containerRegistries: containerRegistriesMock(5),
    isFetched: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationContainerRegistries {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.isFetched = false
    props.containerRegistries = []

    renderWithProviders(<PageOrganizationContainerRegistries {...props} />)

    screen.getByTestId('registries-loader')
  })

  it('should have an empty screen', () => {
    props.isFetched = true
    props.containerRegistries = []

    renderWithProviders(<PageOrganizationContainerRegistries {...props} />)

    screen.findByText('No container registry found.')
  })

  it('should have an list of registries', () => {
    props.isFetched = true
    props.containerRegistries = containerRegistriesMock(1)

    renderWithProviders(<PageOrganizationContainerRegistries {...props} />)

    screen.getByTestId(`registries-list-${props.containerRegistries[0].id}`)
  })
})
