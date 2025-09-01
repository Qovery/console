import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepSummary, { type StepSummaryProps } from './step-summary'

const STATIC_IP = 'STATIC_IP'

const props: StepSummaryProps = {
  generalData: {
    name: 'test',
    description: 'description',
    production: true,
    cloud_provider: CloudProviderEnum.AWS,
    region: 'region',
    credentials: '1',
    credentials_name: 'name',
    installation_type: 'MANAGED',
  },
  resourcesData: {
    cluster_type: 'MANAGED',
    instance_type: 't2.micro',
    nodes: [1, 4],
    disk_size: 50,
  },
  featuresData: {
    vpc_mode: 'DEFAULT',
    features: {
      [STATIC_IP]: {
        id: 'STATIC_IP',
        value: true,
      },
    },
  },
  remoteData: {
    ssh_key: 'ssh_key',
  },
  goToFeatures: jest.fn(),
  goToGeneral: jest.fn(),
  goToResources: jest.fn(),
  goToRemote: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
}

describe('StepSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<StepSummary {...props} />))
    expect(baseElement).toBeTruthy()
  })

  describe('Managed cluster', () => {
    it('should render successfully with the expected sections', () => {
      renderWithProviders(wrapWithReactHookForm(<StepSummary {...props} />))
      expect(screen.getByTestId('summary-general')).toBeInTheDocument()
      expect(screen.getByTestId('summary-resources')).toBeInTheDocument()
      expect(screen.getByTestId('summary-features')).toBeInTheDocument()
    })
  })

  describe('Partially-managed cluster (EKS Anywhere)', () => {
    it('should render successfully with the expected sections', () => {
      const propsPartiallyManaged = {
        ...props,
        generalData: {
          ...props.generalData,
          installation_type: 'PARTIALLY_MANAGED' as ClusterGeneralData['installation_type'],
          production: true,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'region',
        },
        resourcesData: {
          ...props.resourcesData,
          infrastructure_charts_parameters: {
            cert_manager_parameters: {
              kubernetes_namespace: 'test-namespace',
            },
            metal_lb_parameters: {
              ip_address_pools: ['10.0.0.0/24'],
            },
            nginx_parameters: {
              replica_count: 2,
              default_ssl_certificate: 'test-certificate',
              publish_status_address: 'test-address',
              annotation_metal_lb_load_balancer_ips: 'test-ips',
              annotation_external_dns_kubernetes_target: 'test-target',
            },
          },
        },
        kubeconfigData: {
          file_name: 'test-kubeconfig-filename',
          file_content: 'test-content',
          file_size: 100,
        },
      }
      renderWithProviders(wrapWithReactHookForm(<StepSummary {...propsPartiallyManaged} />))

      const generalSection = screen.getByTestId('summary-general')
      expect(generalSection).toBeInTheDocument()
      expect(generalSection).toHaveTextContent('Installation type: Partially managed (EKS Anywhere)')
      expect(generalSection).toHaveTextContent('Cluster name: test')
      expect(generalSection).toHaveTextContent('Production: true')
      expect(generalSection).not.toHaveTextContent('Provider') // For EKS Anywhere, we don't show the provider
      expect(generalSection).not.toHaveTextContent('Region') // For EKS Anywhere, we don't show the region

      const kubeconfigSection = screen.getByTestId('summary-kubeconfig')
      expect(kubeconfigSection).toBeInTheDocument()
      expect(kubeconfigSection).toHaveTextContent('Kubeconfig: test-kubeconfig-filename')

      const eksAnywhereSection = screen.getByTestId('summary-eks-anywhere')
      expect(eksAnywhereSection).toBeInTheDocument()
      expect(eksAnywhereSection).toHaveTextContent('Namespace: test-namespace')
      expect(eksAnywhereSection).toHaveTextContent('IP pool: 10.0.0.0/24')
      expect(eksAnywhereSection).toHaveTextContent('Number of replicas: 2')
      expect(eksAnywhereSection).toHaveTextContent('Default SSL certificate: test-certificate')
      expect(eksAnywhereSection).toHaveTextContent('Publish status address: test-address')
      expect(eksAnywhereSection).toHaveTextContent('Annotation IPs: test-ips')
      expect(eksAnywhereSection).toHaveTextContent('Annotation external DNS target: test-target')
    })
  })
})
