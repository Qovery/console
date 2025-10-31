import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterResourcesSettings, { type ClusterResourcesSettingsProps } from './cluster-resources-settings'

jest.mock('@qovery/domains/cloud-providers/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/cloud-providers/feature'),
    useCloudProviderInstanceTypes: () => ({
      data: [
        {
          type: 'c6g.t2micro',
          name: 'c6g.t2micro',
          cpu: 1,
          ram_in_gb: 1,
          bandwidth_in_gbps: '',
          bandwidth_guarantee: '',
          architecture: 'ARM64',
          gpu_info: null,
          attributes: {
            instance_category: 'c',
            instance_generation: 6,
            instance_family: 'c6g',
            instance_size: 't2.micro',
            meets_resource_reqs: true,
          },
        },
        {
          type: 'm5ad.t2medium',
          name: 'm5ad.t2medium',
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
            instance_size: 't2medium',
            meets_resource_reqs: true,
          },
        },
      ],
    }),
  }
})

describe('ClusterResourcesSettings', () => {
  let defaultValues: ClusterResourcesData
  let props: ClusterResourcesSettingsProps
  beforeEach(() => {
    defaultValues = {
      instance_type: 't2micro',
      disk_size: 50,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }

    props = {
      clusterTypeOptions: [
        {
          label: 'Managed K8S (EKS)',
          value: 'MANAGED',
          description: 'Multiple node cluster',
        },
      ],
      fromDetail: true,
      cloudProvider: CloudProviderEnum.AWS,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 radios, 1 select, 1 input and 1 slider', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} fromDetail={true} />, {
        defaultValues,
      })
    )

    screen.getByLabelText('Instance type')
    screen.getByLabelText('Disk size (GB)')
    screen.getByTestId('input-slider')
  })

  it('should display min and max nodes', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} />, {
        defaultValues,
      })
    )

    screen.getByText('min 1 - max 3')
  })

  it('should display banner box', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} fromDetail={false} />, {
        defaultValues,
      })
    )

    screen.getByTestId('aws-cost-banner')
  })

  it('should not display banner box in detail mode and for Scaleway', () => {
    props.cloudProvider = CloudProviderEnum.SCW

    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} fromDetail />, {
        defaultValues,
      })
    )

    expect(screen.queryByTestId('aws-cost-banner')).not.toBeInTheDocument()
  })

  it('should display warning instance box', async () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} />, {
        defaultValues: {
          ...defaultValues,
          instance_type: 'c6g.t2micro',
        },
      })
    )

    screen.getByTestId('warning-instance')
  })

  it('should display warning for cluster nodes', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} fromDetail />, {
        defaultValues,
      })
    )

    const selectInstanceType = screen.getByLabelText('Instance type')
    await selectEvent.select(selectInstanceType, 'c6g.t2micro (1CPU - 1GB RAM - ARM64)', { container: document.body })

    const inputDiskSize = screen.getByLabelText('Disk size (GB)')
    await userEvent.type(inputDiskSize, '100')

    screen.getByText('Changing these parameters might cause a downtime on your service.')
  })

  describe('STATIC_IP feature backward compatibility', () => {
    it('should handle cluster with old format STATIC_IP (boolean true)', () => {
      const propsWithOldStaticIp: ClusterResourcesSettingsProps = {
        ...props,
        cluster: {
          id: 'test-cluster',
          features: [
            {
              id: 'STATIC_IP',
              value_object: {
                type: 'BOOLEAN',
                value: true,
              },
            },
          ],
        } as any,
      }

      renderWithProviders(
        wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...propsWithOldStaticIp} />, {
          defaultValues,
        })
      )

      // Component should render without errors
      expect(screen.getByText('Resources configuration')).toBeInTheDocument()
    })

    it('should handle cluster with old format STATIC_IP (boolean false)', () => {
      const propsWithOldStaticIp: ClusterResourcesSettingsProps = {
        ...props,
        cluster: {
          id: 'test-cluster',
          features: [
            {
              id: 'STATIC_IP',
              value_object: {
                type: 'BOOLEAN',
                value: false,
              },
            },
          ],
        } as any,
      }

      renderWithProviders(
        wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...propsWithOldStaticIp} />, {
          defaultValues,
        })
      )

      expect(screen.getByText('Resources configuration')).toBeInTheDocument()
    })

    it('should handle cluster with new format STATIC_IP (common)', () => {
      const propsWithNewStaticIp: ClusterResourcesSettingsProps = {
        ...props,
        cluster: {
          id: 'test-cluster',
          features: [
            {
              id: 'STATIC_IP',
              value_object: {
                type: 'STATIC_IP',
                value: {
                  type: 'common',
                  value: true,
                  is_enabled: true,
                },
              },
            },
          ],
        } as any,
      }

      renderWithProviders(
        wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...propsWithNewStaticIp} />, {
          defaultValues,
        })
      )

      expect(screen.getByText('Resources configuration')).toBeInTheDocument()
    })

    it('should handle cluster with new format STATIC_IP (scaleway)', () => {
      const propsWithScalewayStaticIp: ClusterResourcesSettingsProps = {
        ...props,
        cloudProvider: CloudProviderEnum.SCW,
        cluster: {
          id: 'test-cluster',
          features: [
            {
              id: 'STATIC_IP',
              value_object: {
                type: 'STATIC_IP',
                value: {
                  type: 'scaleway',
                  value: true,
                  is_enabled: true,
                  gateway_type: 'VPC_GW_M',
                },
              },
            },
          ],
        } as any,
      }

      renderWithProviders(
        wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...propsWithScalewayStaticIp} />, {
          defaultValues,
        })
      )

      expect(screen.getByText('Resources configuration')).toBeInTheDocument()
    })
  })
})
