import { StateEnum } from 'qovery-typescript-axios'
import * as domainsEnvironmentsFeature from '@qovery/domains/environments/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render buttons with Stopped status', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Deploy')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Export as Terraform')
    screen.getByText('Clone')
    screen.getByText('Delete environment')
  })

  it('should render buttons with Running status', async () => {
    jest.spyOn(domainsEnvironmentsFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        last_deployment_date: '2021-05-20T09:00:00.000Z',
        last_deployment_state: StateEnum.STOPPED,
        id: 'id',
      },
    })
    const { userEvent } = renderWithProviders(<EnvironmentButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Redeploy')
    screen.getByText('Stop')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Copy identifiers')
    screen.getByText('Export as Terraform')
    screen.getByText('Clone')
    screen.getByText('Delete environment')
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
    const { userEvent } = renderWithProviders(<EnvironmentButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Cancel delete')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Export as Terraform')
    screen.getByText('Clone')
  })
})
