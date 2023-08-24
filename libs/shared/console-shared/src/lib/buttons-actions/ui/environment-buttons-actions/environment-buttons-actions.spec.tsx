import { getByText, render } from '__tests__/utils/setup-jest'
import { StateEnum } from 'qovery-typescript-axios'
import * as domainsEnvironmentsFeature from '@qovery/domains/environments/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import EnvironmentButtonsActions, { type EnvironmentButtonsActionsProps } from './environment-buttons-actions'

const mockEnvironment = environmentFactoryMock(1)[0]
const props: EnvironmentButtonsActionsProps = {
  environment: mockEnvironment,
  hasServices: true,
}

describe('EnvironmentButtonsActions', () => {
  beforeEach(() => {
    jest.spyOn(domainsEnvironmentsFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.STOPPED,
        last_deployment_date: '2021-05-20T09:00:00.000Z',
        last_deployment_state: StateEnum.STOPPED,
        id: 'id',
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render buttons with Stopped status', () => {
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })

  it('should render buttons with Running status', () => {
    jest.spyOn(domainsEnvironmentsFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        last_deployment_date: '2021-05-20T09:00:00.000Z',
        last_deployment_state: StateEnum.STOPPED,
        id: 'id',
      },
    })
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })

  it('should render actions for DELETING status', async () => {
    jest.spyOn(domainsEnvironmentsFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DELETING,
        last_deployment_date: '2021-05-20T09:00:00.000Z',
        last_deployment_state: StateEnum.STOPPED,
        id: 'id',
      },
    })
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)

    getByText(baseElement, 'Logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Cancel delete')
  })
})
