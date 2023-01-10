import { act, fireEvent, getByRole } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import NeedRedeployFlag from './need-redeploy-flag'

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]

describe('NeedRedeployFlag', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NeedRedeployFlag application={mockApplication} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    mockApplication.status = {
      state: StateEnum.DEPLOYED,
      service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
    }
    const { baseElement } = render(<NeedRedeployFlag application={mockApplication} />)

    getByRole(baseElement, 'button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    mockApplication.status = {
      state: StateEnum.DEPLOYED,
      service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
    }
    const { baseElement } = render(<NeedRedeployFlag application={mockApplication} />)

    getByRole(baseElement, 'button', { name: 'Redeploy now' })
  })

  it('should call the onSubmit function on button click', async () => {
    mockApplication.status = {
      state: StateEnum.DEPLOYED,
      service_deployment_status: ServiceDeploymentStatusEnum.OUT_OF_DATE,
    }
    const spy = jest.fn()
    const { baseElement } = render(<NeedRedeployFlag application={mockApplication} onClickCTA={spy} />)

    const button = getByRole(baseElement, 'button', { name: 'Redeploy now' })

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })
})
