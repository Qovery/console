import { ServiceDeploymentStatusEnum, ServiceTypeEnum, StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeployServiceImport from '../hooks/use-deploy-service/use-deploy-service'
import * as useDeploymentStatusImport from '../hooks/use-deployment-status/use-deployment-status'
import * as useServiceImport from '../hooks/use-service/use-service'
import NeedRedeployFlag from './need-redeploy-flag'

const useDeployServiceSpy = jest.spyOn(useDeployServiceImport, 'useDeployService') as jest.Mock

describe('NeedRedeployFlag', () => {
  beforeEach(() => {
    useDeployServiceSpy.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })

    const { baseElement } = renderWithProviders(<NeedRedeployFlag />)
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    screen.getByRole('button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    screen.getByRole('button', { name: 'Redeploy now' })
  })

  it('should call the onSubmit function on button click', async () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
      },
    })
    jest.spyOn(useServiceImport, 'useService').mockReturnValue({
      data: {
        id: '1',
        serviceType: ServiceTypeEnum.APPLICATION,
        created_at: '1696923386000',
        healthchecks: {},
      },
    })

    const { userEvent } = renderWithProviders(<NeedRedeployFlag />)

    const button = screen.getByRole('button', { name: 'Redeploy now' })

    await userEvent.click(button)

    expect(useDeployServiceSpy().mutate).toHaveBeenCalled()
  })
})
