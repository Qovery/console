import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterResourcesSettings, { type ClusterResourcesSettingsProps } from './cluster-resources-settings'

describe('ClusterResourcesSettings', () => {
  let defaultValues: ClusterResourcesData
  let props: ClusterResourcesSettingsProps
  beforeEach(() => {
    defaultValues = {
      instance_type: 't2.micro',
      disk_size: 50,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }

    props = {
      instanceTypeOptions: [
        {
          label: 't2.micro (1CPU - 1GB RAM)',
          value: 't2.micro',
        },
        {
          label: 't2.small (1CPU - 2GB RAM)',
          value: 't2.small',
        },
        {
          label: 't2.medium (2CPU - 4GB RAM - ARM)',
          value: 't2.medium',
        },
      ],
      clusterTypeOptions: [
        {
          label: 'Managed K8S (EKS)',
          value: 'MANAGED',
        },
        {
          label: 'BETA - Single EC2 (K3S)',
          value: 'SINGLE',
        },
      ],
      fromDetail: false,
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
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} />, {
        defaultValues,
      })
    )

    screen.getByLabelText('Managed K8S (EKS)')
    screen.getByLabelText('BETA - Single EC2 (K3S)')
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
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} />, {
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

    expect(screen.queryByTestId('aws-cost-banner')).toBeNull()
  })

  it('should display warning instance box', async () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<ClusterResourcesSettings {...props} />, {
        defaultValues: {
          ...defaultValues,
          instance_type: 't2.medium',
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
    await selectEvent.select(selectInstanceType, 't2.micro (1CPU - 1GB RAM)', { container: document.body })

    const inputDiskSize = screen.getByLabelText('Disk size (GB)')
    await userEvent.type(inputDiskSize, '100')

    screen.getByText('Changing these parameters might cause a downtime on your service.')
  })
})
