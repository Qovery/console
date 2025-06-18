import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterProgressBarNode, type ClusterProgressBarNodeProps } from './cluster-progress-bar-node'

const defaultProps: ClusterProgressBarNodeProps = {
  used: 50,
  reserved: 75,
  total: 100,
}

describe('ClusterProgressBarNode', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterProgressBarNode {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display yellow bar when used > reserved', () => {
    const props = {
      used: 80,
      reserved: 60,
      total: 100,
    }

    const { container } = renderWithProviders(<ClusterProgressBarNode {...props} />)

    const yellowBar = container.querySelector('[style*="left: 60%"]')
    expect(yellowBar).toBeInTheDocument()
  })

  it('should display purple line when reserved < 99%', () => {
    const { container } = renderWithProviders(<ClusterProgressBarNode {...defaultProps} />)

    const purpleLine = container.querySelector('.bg-purple-500')
    expect(purpleLine).toBeInTheDocument()
  })

  it('should not display purple line when reserved >= 99%', () => {
    const props = {
      used: 98,
      reserved: 99,
      total: 100,
    }

    const { container } = renderWithProviders(<ClusterProgressBarNode {...props} />)

    const purpleLine = container.querySelector('.bg-purple-500')
    expect(purpleLine).not.toBeInTheDocument()
  })

  it('should handle zero total', () => {
    const props = {
      used: 0,
      reserved: 0,
      total: 0,
    }

    const { baseElement } = renderWithProviders(<ClusterProgressBarNode {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
