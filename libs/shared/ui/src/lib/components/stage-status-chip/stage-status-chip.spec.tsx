import { StageStatusEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { StageStatusChip } from './stage-status-chip'

describe('StageStatusChip', () => {
  it('renders a skeleton when status is undefined', () => {
    renderWithProviders(<StageStatusChip status={undefined} />)
    const skeleton = screen.getByRole('generic', { busy: true })
    expect(skeleton).toBeInTheDocument()
  })

  it('renders the correct icon for each status', () => {
    const statuses = Object.values(StageStatusEnum)

    statuses.forEach((status) => {
      const { container } = renderWithProviders(<StageStatusChip status={status} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(<StageStatusChip status="DONE" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders an animated loader for ONGOING status', () => {
    renderWithProviders(<StageStatusChip status="ONGOING" />)
    const loader = screen.getByLabelText('loading')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveClass('animate-spin')
  })
})
