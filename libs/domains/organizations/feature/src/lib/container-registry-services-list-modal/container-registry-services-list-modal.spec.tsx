import { ContainerRegistryAssociatedServiceType } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useContainerRegistryAssociatedServices from '../hooks/use-container-registry-associated-services/use-container-registry-associated-services'
import ContainerRegistryServicesListModal, {
  type ContainerRegistryServicesListModalProps,
  containerRegistryGroupByProjectEnvironmentsServices,
} from './container-registry-services-list-modal'

const useContainerRegistryAssociatedServicesMockSpy = jest.spyOn(
  useContainerRegistryAssociatedServices,
  'useContainerRegistryAssociatedServices'
) as jest.Mock

const props: ContainerRegistryServicesListModalProps = {
  organizationId: '0000-0000-0000',
  containerRegistryId: '0000-0000-0000',
  onClose: jest.fn(),
  associatedServicesCount: 3,
}

const data = [
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    service_id: '101',
    service_name: 'Service 1',
    service_type: ContainerRegistryAssociatedServiceType.CONTAINER,
  },
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    service_id: '102',
    service_name: 'Service 2',
    service_type: ContainerRegistryAssociatedServiceType.CRON,
  },
  {
    project_id: '2',
    project_name: 'Project 2',
    environment_id: '1',
    environment_name: 'Staging',
    service_id: '201',
    service_name: 'Service 3',
    service_type: ContainerRegistryAssociatedServiceType.LIFECYCLE,
  },
]

describe('ContainerRegistryServicesListModal', () => {
  beforeEach(() => {
    useContainerRegistryAssociatedServicesMockSpy.mockReturnValue({
      data,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ContainerRegistryServicesListModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should group data by projects, environments, and services correctly', () => {
    const result = containerRegistryGroupByProjectEnvironmentsServices(data)

    expect(result).toHaveLength(2)

    expect(result[0].project_id).toBe('1')
    expect(result[0].project_name).toBe('Project 1')
    expect(result[0].environments).toHaveLength(1)
    expect(result[0].environments[0].environment_id).toBe('1')
    expect(result[0].environments[0].environment_name).toBe('Development')
    expect(result[0].environments[0].services).toHaveLength(2)

    expect(result[1].project_id).toBe('2')
    expect(result[1].project_name).toBe('Project 2')
    expect(result[1].environments).toHaveLength(1)
    expect(result[1].environments[0].environment_id).toBe('1')
    expect(result[1].environments[0].environment_name).toBe('Staging')
    expect(result[1].environments[0].services).toHaveLength(1)
  })

  it('should match snapshots', async () => {
    const { baseElement, userEvent } = renderWithProviders(<ContainerRegistryServicesListModal {...props} />)

    const triggers = screen.getAllByRole('button')
    screen.getByText(/project 1/i)
    await userEvent.click(triggers[0])

    const triggerEnvironment = screen.getByText(/development/i).parentElement
    await userEvent.click(triggerEnvironment!)

    expect(baseElement).toMatchSnapshot()
  })
})
