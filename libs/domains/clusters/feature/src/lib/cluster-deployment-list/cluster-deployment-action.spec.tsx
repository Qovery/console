import { ClusterDeploymentHistoryOperationEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterDeploymentAction } from './cluster-deployment-action'

describe('ClusterDeploymentAction', () => {
  it.each([ClusterDeploymentHistoryOperationEnum.CLUSTER, undefined])(
    'renders the deployment action when operation is %s',
    (operation) => {
      renderWithProviders(<ClusterDeploymentAction status="DEPLOY" operation={operation} />)

      expect(screen.getByText('Deploy')).toBeInTheDocument()
      expect(screen.queryByText('Operator')).not.toBeInTheDocument()
    }
  )

  it('renders the Operator action with a hover tooltip and no tab stop for an Operator update', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterDeploymentAction status="DEPLOY" operation={ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE} />
    )

    await userEvent.hover(screen.getByText('Operator'))

    expect(screen.queryByText('Deploy')).not.toBeInTheDocument()
    expect(screen.getByText('Operator').closest('[tabindex]')).toBeNull()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Operator update')
  })
})
