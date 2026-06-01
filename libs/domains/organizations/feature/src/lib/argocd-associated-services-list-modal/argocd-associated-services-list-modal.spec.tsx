import { ArgocdAssociatedServiceType } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import * as useArgoCdAssociatedServices from '../hooks/use-argocd-associated-services/use-argocd-associated-services'
import ArgoCdAssociatedServicesListModal, {
  type ArgoCdAssociatedServicesListModalProps,
  argoCdGroupByProjectEnvironmentsServices,
} from './argocd-associated-services-list-modal'

const useArgoCdAssociatedServicesMockSpy = jest.spyOn(
  useArgoCdAssociatedServices,
  'useArgoCdAssociatedServices'
) as jest.Mock

const props: ArgoCdAssociatedServicesListModalProps = {
  organizationId: 'organization-id',
  clusterId: 'cluster-id',
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
    service_type: ArgocdAssociatedServiceType.ARGOCD_APP,
  },
  {
    project_id: '1',
    project_name: 'Project 1',
    environment_id: '1',
    environment_name: 'Development',
    service_id: '102',
    service_name: 'Service 2',
    service_type: ArgocdAssociatedServiceType.ARGOCD_APP,
  },
  {
    project_id: '2',
    project_name: 'Project 2',
    environment_id: '1',
    environment_name: 'Staging',
    service_id: '201',
    service_name: 'Service 3',
    service_type: ArgocdAssociatedServiceType.ARGOCD_APP,
  },
]

describe('ArgoCdAssociatedServicesListModal', () => {
  beforeEach(() => {
    useArgoCdAssociatedServicesMockSpy.mockReturnValue({
      data,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ArgoCdAssociatedServicesListModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should group data by projects, environments, and services correctly', () => {
    const result = argoCdGroupByProjectEnvironmentsServices(data)

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
})
