import { CpuArchitectureEnum, type KarpenterNodePoolRequirement } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { KarpenterInstanceTypePreview } from './karpenter-instance-type-preview'

describe('KarpenterInstanceTypePreview', () => {
  const defaultProps = {
    defaultServiceArchitecture: CpuArchitectureEnum.AMD64,
  }

  it('renders default architecture when no requirements provided', () => {
    renderWithProviders(<KarpenterInstanceTypePreview {...defaultProps} />)

    expect(screen.getByText('Default build architecture:')).toBeInTheDocument()
    expect(screen.getByText('AMD64')).toBeInTheDocument()
  })

  it('renders all requirement types when provided', () => {
    const requirements = [
      { key: 'Arch', values: ['amd64', 'arm64'] },
      { key: 'InstanceSize', values: ['small', 'medium', 'large'] },
      { key: 'InstanceFamily', values: ['t3', 'm5', 'c5'] },
    ] as KarpenterNodePoolRequirement[]

    renderWithProviders(<KarpenterInstanceTypePreview {...defaultProps} requirements={requirements} />)

    expect(screen.getByText('Architectures:')).toBeInTheDocument()
    expect(screen.getByText('AMD64, ARM64')).toBeInTheDocument()

    expect(screen.getByText('Families:')).toBeInTheDocument()
    expect(screen.getByText('c5, m5, t3')).toBeInTheDocument()

    expect(screen.getByText('Sizes:')).toBeInTheDocument()
    expect(screen.getByText('small, medium, large')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = renderWithProviders(
      <KarpenterInstanceTypePreview {...defaultProps} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles empty requirement values', () => {
    const requirements = [
      { key: 'Arch', operator: 'In', values: [] },
      { key: 'InstanceSize', operator: 'In', values: [] },
      { key: 'InstanceFamily', operator: 'In', values: [] },
    ] as KarpenterNodePoolRequirement[]

    renderWithProviders(<KarpenterInstanceTypePreview {...defaultProps} requirements={requirements} />)

    expect(screen.getByText('Default build architecture:')).toBeInTheDocument()
    expect(screen.queryByText('Architectures:')).not.toBeInTheDocument()
    expect(screen.queryByText('Families:')).not.toBeInTheDocument()
    expect(screen.queryByText('Sizes:')).not.toBeInTheDocument()
  })
})
