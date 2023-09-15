import { StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StatusChip, { type StatusChipProps } from './status-chip'

describe('StatusChip', () => {
  let props: StatusChipProps

  beforeEach(() => {
    props = {
      status: StateEnum.DEPLOYED,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StatusChip {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render DeployedIcon when status is DEPLOYED', () => {
    const { container } = renderWithProviders(<StatusChip status="DEPLOYED" />)
    const deployedIcon = container.querySelector('.DeployedIcon')
    expect(deployedIcon).toBeInTheDocument()
  })

  it('should render RestartedIcon when status is RESTARTED', () => {
    const { container } = renderWithProviders(<StatusChip status="RESTARTED" />)
    const restartedIcon = container.querySelector('.RestartedIcon')
    expect(restartedIcon).toBeInTheDocument()
  })

  it('should render QueuedIcon when status is QUEUED', () => {
    const { container } = renderWithProviders(<StatusChip status="QUEUED" />)
    const queuedIcon = container.querySelector('.QueuedIcon')
    expect(queuedIcon).toBeInTheDocument()
  })

  it('should render ErrorIcon with custom tooltip message', () => {
    renderWithProviders(<StatusChip status="DEPLOYMENT_ERROR" appendTooltipMessage="Custom message" />)
    const tooltipContent = screen.getByText('Deployment error - Custom message')
    expect(tooltipContent).toBeInTheDocument()
  })

  it('should render WarningIcon when status is WARNING', () => {
    const { container } = renderWithProviders(<StatusChip status="WARNING" />)
    const warningIcon = container.querySelector('.WarningIcon')
    expect(warningIcon).toBeInTheDocument()
  })
})
