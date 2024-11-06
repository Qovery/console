import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { KarpenterInstanceFilterModal, getFilteredInstances, getMaxValue } from './karpenter-instance-filter-modal'

jest.mock('../hooks/use-cloud-provider-instance-types/use-cloud-provider-instance-types', () => {
  return {
    ...jest.requireActual('../hooks/use-cloud-provider-instance-types/use-cloud-provider-instance-types'),
    useCloudProviderInstanceTypes: () => ({
      data: [
        {
          type: 'c6g.16xlarge',
          name: 'c6g.16xlarge',
          cpu: 64,
          ram_in_gb: 128,
          bandwidth_in_gbps: '',
          bandwidth_guarantee: '',
          architecture: 'ARM64',
          gpu_info: null,
          attributes: {
            instance_category: 'c',
            instance_generation: 6,
            instance_family: 'c6g',
            instance_size: '16xlarge',
            meets_resource_reqs: true,
          },
        },
        {
          type: 'm5ad.16xlarge',
          name: 'm5ad.16xlarge',
          cpu: 64,
          ram_in_gb: 256,
          bandwidth_in_gbps: '',
          bandwidth_guarantee: '',
          architecture: 'AMD64',
          gpu_info: null,
          attributes: {
            instance_category: 'm',
            instance_generation: 5,
            instance_family: 'm5ad',
            instance_size: '16xlarge',
            meets_resource_reqs: true,
          },
        },
      ],
    }),
  }
})

describe('KarpenterInstanceFilterModal', () => {
  it('renders form with instance types data', async () => {
    renderWithProviders(
      <KarpenterInstanceFilterModal
        cloudProvider="AWS"
        clusterRegion="us-east-1"
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Karpenter Instance Visual filter')).toBeInTheDocument()
      expect(screen.getByText('Architecture')).toBeInTheDocument()
      expect(screen.getByLabelText('AMD64')).toBeInTheDocument()
      expect(screen.getByLabelText('ARM64')).toBeInTheDocument()
      expect(screen.getByLabelText('16xlarge')).toBeInTheDocument()
    })
  })

  it('handles architecture selection', async () => {
    const { userEvent } = renderWithProviders(
      <KarpenterInstanceFilterModal
        cloudProvider="AWS"
        clusterRegion="us-east-1"
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText('AMD64')).toBeInTheDocument()
    })

    const amd64Checkbox = screen.getByLabelText('AMD64')
    await userEvent.click(amd64Checkbox)

    expect(amd64Checkbox).toBeChecked()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })
})

describe('Utility Functions', () => {
  const mockInstanceTypes = [
    {
      name: 't3.micro',
      cpu: 2,
      ram_in_gb: 1,
      architecture: 'AMD64',
      attributes: {
        instance_category: 'general',
        instance_family: 't3',
        instance_size: 'micro',
        meets_resource_reqs: true,
      },
    },
    {
      name: 't4g.small',
      cpu: 4,
      ram_in_gb: 8,
      architecture: 'ARM64',
      attributes: {
        instance_category: 'general',
        instance_family: 't4g',
        instance_size: 'small',
        meets_resource_reqs: true,
      },
    },
  ] as ClusterInstanceTypeResponseListResultsInner[]

  const filters = {
    AMD64: true,
    ARM64: true,
    cpu: [1, 4] as [number, number],
    memory: [1, 8] as [number, number],
    categories: { general: ['t3', 't4g'] },
    sizes: ['micro', 'small'],
  }

  it('should return the maximum CPU value', () => {
    const result = getMaxValue(mockInstanceTypes, 'cpu')
    expect(result).toBe(4)
  })

  it('should return the maximum RAM value', () => {
    const result = getMaxValue(mockInstanceTypes, 'ram_in_gb')
    expect(result).toBe(8)
  })

  it('should filter instances based on all criteria', () => {
    const result = getFilteredInstances(mockInstanceTypes, filters)
    expect(result).toHaveLength(2)
  })

  it('should filter by architecture', () => {
    const amd64Only = getFilteredInstances(mockInstanceTypes, { ...filters, ARM64: false })
    expect(amd64Only).toHaveLength(1)
    expect(amd64Only[0].architecture).toBe('AMD64')
  })

  it('should filter by CPU range', () => {
    const lowCpu = getFilteredInstances(mockInstanceTypes, {
      ...filters,
      cpu: [1, 2] as [number, number],
    })
    expect(lowCpu).toHaveLength(1)
    expect(lowCpu[0].cpu).toBe(2)
  })
})
