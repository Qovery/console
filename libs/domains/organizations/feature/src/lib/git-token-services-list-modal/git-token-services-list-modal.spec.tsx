import { GitTokenAssociatedServiceType } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useGitTokenAssociatedServices from '../hooks/use-git-token-associated-services/use-git-token-associated-services'
import GitTokenServicesListModal, {
  type GitTokenServicesListModalProps,
  groupByProjectEnvironmentsServices,
} from './git-token-services-list-modal'

const useGitTokenAssociatedServicesMockSpy = jest.spyOn(
  useGitTokenAssociatedServices,
  'useGitTokenAssociatedServices'
) as jest.Mock

const props: GitTokenServicesListModalProps = {
  organizationId: '0000-0000-0000',
  gitTokenId: '0000-0000-0000',
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
    service_type: GitTokenAssociatedServiceType.APPLICATION,
  },
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    service_id: '102',
    service_name: 'Service 2',
    service_type: GitTokenAssociatedServiceType.HELM,
  },
  {
    project_id: '2',
    project_name: 'Project 2',
    environment_id: '1',
    environment_name: 'Staging',
    service_id: '201',
    service_name: 'Service 3',
    service_type: GitTokenAssociatedServiceType.CRON,
  },
]

describe('GitTokenServicesListModal', () => {
  beforeEach(() => {
    useGitTokenAssociatedServicesMockSpy.mockReturnValue({
      data,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<GitTokenServicesListModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should group data by projects, environments, and services correctly', () => {
    const result = groupByProjectEnvironmentsServices(data)

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
    const { baseElement, userEvent } = renderWithProviders(<GitTokenServicesListModal {...props} />)

    const triggers = screen.getAllByRole('button')
    screen.getByText(/project 1/i)
    await userEvent.click(triggers[0])

    const triggerEnvironment = screen.getByText(/development/i).parentElement
    await userEvent.click(triggerEnvironment!)

    expect(baseElement).toMatchSnapshot()
  })
})
