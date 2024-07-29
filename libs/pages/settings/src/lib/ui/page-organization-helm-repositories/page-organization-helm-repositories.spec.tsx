import { helmRepositoriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  PageOrganizationHelmRepositories,
  type PageOrganizationHelmRepositoriesProps,
} from './page-organization-helm-repositories'

describe('PageOrganizationHelmRepositories', () => {
  const props: PageOrganizationHelmRepositoriesProps = {
    onOpenServicesAssociatedModal: jest.fn(),
    onAddRepository: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    helmRepositories: helmRepositoriesMock(5),
    isFetched: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationHelmRepositories {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.isFetched = false
    props.helmRepositories = []

    renderWithProviders(<PageOrganizationHelmRepositories {...props} />)

    screen.getByTestId('repositories-loader')
  })

  it('should have an empty screen', () => {
    props.isFetched = true
    props.helmRepositories = []

    renderWithProviders(<PageOrganizationHelmRepositories {...props} />)

    screen.findByText('No helm repository found.')
  })

  it('should have an list of repositories', () => {
    props.isFetched = true
    props.helmRepositories = helmRepositoriesMock(1)

    renderWithProviders(<PageOrganizationHelmRepositories {...props} />)

    screen.getByTestId(`repositories-list-${props.helmRepositories[0].id}`)
  })
})
