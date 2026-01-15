import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ButtonPopoverSubnets, removeEmptySubnet } from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render children when disabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled>
          <button>Toggle</button>
        </ButtonPopoverSubnets>,
        { defaultValues: { karpenter: { enabled: false } } }
      )
    )

    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument()
  })

  it('should render popover when not disabled and karpenter is enabled', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          <button>Toggle</button>
        </ButtonPopoverSubnets>,
        { defaultValues: { karpenter: { enabled: true }, aws_existing_vpc: { eks_subnets: [] } } }
      )
    )

    await waitFor(() => {
      expect(screen.getByText('EKS private subnet IDs')).toBeInTheDocument()
    })
  })

  it('should render Cancel and Confirm buttons in popover', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          <button>Toggle</button>
        </ButtonPopoverSubnets>,
        { defaultValues: { karpenter: { enabled: true }, aws_existing_vpc: { eks_subnets: [] } } }
      )
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })
  })

  it('should have Confirm button disabled when no valid subnets', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          <button>Toggle</button>
        </ButtonPopoverSubnets>,
        { defaultValues: { karpenter: { enabled: true }, aws_existing_vpc: { eks_subnets: [] } } }
      )
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    })
  })
})

describe('removeEmptySubnet', () => {
  it('should filter out completely empty subnets', () => {
    const subnets = [
      { A: 'subnet-1', B: 'subnet-2', C: 'subnet-3' },
      { A: '', B: '', C: '' },
      { A: 'subnet-4', B: '', C: '' },
    ]

    const result = removeEmptySubnet(subnets)

    expect(result).toHaveLength(2)
    expect(result?.[0]).toEqual({ A: 'subnet-1', B: 'subnet-2', C: 'subnet-3' })
    expect(result?.[1]).toEqual({ A: 'subnet-4', B: '', C: '' })
  })

  it('should return undefined for undefined input', () => {
    const result = removeEmptySubnet(undefined)
    expect(result).toBeUndefined()
  })

  it('should return empty array when all subnets are empty', () => {
    const subnets = [
      { A: '', B: '', C: '' },
      { A: '', B: '', C: '' },
    ]

    const result = removeEmptySubnet(subnets)

    expect(result).toHaveLength(0)
  })

  it('should keep subnet with only one field filled', () => {
    const subnets = [
      { A: 'subnet-a', B: '', C: '' },
      { A: '', B: 'subnet-b', C: '' },
      { A: '', B: '', C: 'subnet-c' },
    ]

    const result = removeEmptySubnet(subnets)

    expect(result).toHaveLength(3)
  })

  it('should handle empty array input', () => {
    const result = removeEmptySubnet([])
    expect(result).toHaveLength(0)
  })
})
