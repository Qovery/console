import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import NeedRedeployFlag from './need-redeploy-flag'

describe('NeedRedeployFlag', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.NEVER_DEPLOYED} onClickButton={jest.fn()} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    renderWithProviders(
      <NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.NEVER_DEPLOYED} onClickButton={jest.fn()} />
    )
    screen.getByRole('button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    renderWithProviders(
      <NeedRedeployFlag deploymentStatus={ClusterDeploymentStatusEnum.OUT_OF_DATE} onClickButton={jest.fn()} />
    )
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
