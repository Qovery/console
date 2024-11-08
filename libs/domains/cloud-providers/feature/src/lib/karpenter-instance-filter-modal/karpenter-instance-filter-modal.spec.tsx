import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { KarpenterInstanceFilterModal } from './karpenter-instance-filter-modal'

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
})
