import { ClusterDeploymentHistoryOperationEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DeploymentAction, getTriggerAction } from './deployment-action'

describe('getTriggerAction', () => {
  it('returns undefined without status details', () => {
    expect(getTriggerAction(undefined)).toBeUndefined()
  })

  it('prefers the sub action when it is set', () => {
    expect(getTriggerAction({ action: 'DEPLOY', sub_action: 'TERRAFORM_DESTROY' })).toBe('TERRAFORM_DESTROY')
  })

  it('returns the action when the sub action is NONE or missing', () => {
    expect(getTriggerAction({ action: 'STOP', sub_action: 'NONE' })).toBe('STOP')
    expect(getTriggerAction({ action: 'RESTART' })).toBe('RESTART')
  })

  it('falls back to UNKNOWN when status details have no action', () => {
    expect(getTriggerAction({})).toBe('UNKNOWN')
  })
})

describe('DeploymentAction', () => {
  it('renders the action label derived from the status', () => {
    renderWithProviders(<DeploymentAction status="DEPLOY" />)

    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('renders the Operator action with a screen-reader description for an Operator update', () => {
    const { container } = renderWithProviders(
      <DeploymentAction status="DEPLOY" operation={ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE} />
    )

    expect(screen.getByText('Operator')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Operator update')).toHaveClass('sr-only')
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument()
    expect(container.querySelector('.fa-rotate-right')).toBeInTheDocument()
    expect(container.querySelector('.fa-rocket')).not.toBeInTheDocument()
    expect(container.querySelector('[tabindex]')).toBeNull()
  })

  it('renders the status action without a description for a cluster operation', () => {
    const { container } = renderWithProviders(
      <DeploymentAction status="DEPLOY" operation={ClusterDeploymentHistoryOperationEnum.CLUSTER} />
    )

    expect(screen.getByText('Deploy')).not.toHaveAttribute('aria-hidden')
    expect(screen.queryByText('Operator update')).not.toBeInTheDocument()
    expect(container.querySelector('.fa-rocket')).toBeInTheDocument()
  })
})
