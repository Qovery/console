import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import NeedRedeployFlag from './need-redeploy-flag'

const mockCluster: ClusterEntity = clusterFactoryMock(1)[0]

describe('NeedRedeployFlag', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<NeedRedeployFlag deploymentStatus={mockCluster.deployment_status} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    renderWithProviders(<NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.NEVER_DEPLOYED} />)
    screen.getByRole('button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    renderWithProviders(<NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.OUT_OF_DATE} />)
    screen.getByRole('button', { name: 'Redeploy now' })
  })

  it('should call the onSubmit function on button click', async () => {
    const spy = jest.fn()
    const { userEvent } = renderWithProviders(
      <NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.OUT_OF_DATE} onClickButton={spy} />
    )

    const button = screen.getByRole('button', { name: 'Redeploy now' })
    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })
})
