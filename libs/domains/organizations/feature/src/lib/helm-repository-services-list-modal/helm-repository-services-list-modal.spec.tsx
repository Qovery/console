import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useHelmRepositoryAssociatedServices from '../hooks/use-helm-repository-associated-services/use-helm-repository-associated-services'
import HelmRepositoryServicesListModal, {
  type HelmRepositoryServicesListModalProps,
  helmRepositoryGroupByProjectEnvironmentsServices,
} from './helm-repository-services-list-modal'

const useHelmRepositoryAssociatedServicesMockSpy = jest.spyOn(
  useHelmRepositoryAssociatedServices,
  'useHelmRepositoryAssociatedServices'
) as jest.Mock

const props: HelmRepositoryServicesListModalProps = {
  organizationId: '0000-0000-0000',
  helmRepositoryId: '0000-0000-0000',
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
  },
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    service_id: '102',
    service_name: 'Service 2',
  },
  {
    project_id: '2',
    project_name: 'Project 2',
    environment_id: '1',
    environment_name: 'Staging',
    service_id: '201',
    service_name: 'Service 3',
  },
]

describe('HelmRepositoryServicesListModal', () => {
  beforeEach(() => {
    useHelmRepositoryAssociatedServicesMockSpy.mockReturnValue({
      data,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<HelmRepositoryServicesListModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should group data by projects, environments, and services correctly', () => {
    const result = helmRepositoryGroupByProjectEnvironmentsServices(data)

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
    const { baseElement, userEvent } = renderWithProviders(<HelmRepositoryServicesListModal {...props} />)

    const triggers = screen.getAllByRole('button')
    screen.getByText(/project 1/i)
    await userEvent.click(triggers[0])

    const triggerEnvironment = screen.getByText(/development/i).parentElement
    await userEvent.click(triggerEnvironment!)

    expect(baseElement).toMatchSnapshot()
  })
})
