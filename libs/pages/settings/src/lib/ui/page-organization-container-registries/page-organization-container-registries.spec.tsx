import { render } from '@testing-library/react'
import { containerRegistriesMock } from '@qovery/shared/factories'
import PageOrganizationContainerRegistries, {
  PageOrganizationContainerRegistriesProps,
} from './page-organization-container-registries'

describe('PageOrganizationContainerRegistries', () => {
  const props: PageOrganizationContainerRegistriesProps = {
    onAddRegistry: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    containerRegistries: containerRegistriesMock(5),
    loading: 'loaded',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationContainerRegistries {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.loading = 'loading'
    props.containerRegistries = []

    const { getByTestId } = render(<PageOrganizationContainerRegistries {...props} />)

    getByTestId('registries-loader')
  })

  it('should have an empty screen', () => {
    props.loading = 'loaded'
    props.containerRegistries = []

    const { getByTestId } = render(<PageOrganizationContainerRegistries {...props} />)

    getByTestId('empty-state')
  })

  it('should have an list of registries', () => {
    props.loading = 'loaded'
    props.containerRegistries = containerRegistriesMock(1)

    const { getByTestId } = render(<PageOrganizationContainerRegistries {...props} />)

    getByTestId(`registries-list-${props.containerRegistries[0].id}`)
  })
})
