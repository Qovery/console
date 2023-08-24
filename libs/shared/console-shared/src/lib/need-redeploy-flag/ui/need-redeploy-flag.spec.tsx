import { act, fireEvent, getByRole, render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import NeedRedeployFlag from './need-redeploy-flag'

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]

describe('NeedRedeployFlag', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NeedRedeployFlag service={mockApplication} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })
    const { baseElement } = render(<NeedRedeployFlag service={mockApplication} />)

    getByRole(baseElement, 'button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
      },
    })
    const { baseElement } = render(<NeedRedeployFlag service={mockApplication} />)

    getByRole(baseElement, 'button', { name: 'Redeploy now' })
  })

  it('should call the onSubmit function on button click', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
      },
    })
    const spy = jest.fn()
    const { baseElement } = render(<NeedRedeployFlag service={mockApplication} onClickCTA={spy} />)

    const button = getByRole(baseElement, 'button', { name: 'Redeploy now' })

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })
})
