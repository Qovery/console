import { CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsFeatures, { type PageSettingsFeaturesProps } from './page-settings-features'

const cluster = clusterFactoryMock(1)[0]

describe('PageSettingsFeatures', () => {
  const props: PageSettingsFeaturesProps = {
    loading: false,
    cloudProvider: CloudProviderEnum.AWS,
    features: cluster.features,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsFeatures {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a loader spinner', () => {
    props.loading = true
    renderWithProviders(<PageSettingsFeatures {...props} />)
    screen.getByTestId('spinner')
  })

  it('should render a list of features', () => {
    props.loading = false
    props.features = [
      {
        title: 'feature 1',
        value_object: {
          type: 'BOOLEAN',
          value: true,
        },
        description: 'description 1',
        cost_per_month: 80,
      },
      {
        title: 'feature 2',
        value_object: {
          type: 'BOOLEAN',
          value: true,
        },
        description: 'description 2',
        cost_per_month: 80,
      },
    ]

    renderWithProviders(<PageSettingsFeatures {...props} />)
    screen.getAllByTestId('feature')
  })

  it('renders with existing VPC data', () => {
    const mockFeatures: ClusterFeatureResponse[] = [
      {
        value_object: {
          type: 'AWS_USER_PROVIDED_NETWORK',
          value: {
            aws_vpc_eks_id: 'vpc-id',
            eks_subnets_zone_a_ids: ['subnet-eks-zone-a'],
            eks_subnets_zone_b_ids: ['subnet-eks-zone-b'],
            eks_subnets_zone_c_ids: ['subnet-eks-zone-c'],
            documentdb_subnets_zone_a_ids: ['subnet-documentdb-zone-a'],
            documentdb_subnets_zone_b_ids: ['subnet-documentdb-zone-b'],
            documentdb_subnets_zone_c_ids: ['subnet-documentdb-zone-c'],
            elasticache_subnets_zone_a_ids: ['subnet-elasticache-zone-a'],
            elasticache_subnets_zone_b_ids: ['subnet-elasticache-zone-b'],
            elasticache_subnets_zone_c_ids: ['subnet-elasticache-zone-c'],
            rds_subnets_zone_a_ids: ['subnet-rds-zone-a'],
            rds_subnets_zone_b_ids: ['subnet-rds-zone-b'],
            rds_subnets_zone_c_ids: ['subnet-rds-zone-c'],
          },
        },
        id: 'EXISTING_VPC',
        accepted_values: [],
        title: 'Install cluster on an existing VPC',
        description:
          'Install a cluster on an existing VPC. You are responsible to create all the network plan and get the routing right on your own.',
        cost_per_month_in_cents: 0,
        cost_per_month: 0,
        is_value_updatable: false,
      },
    ]

    renderWithProviders(<PageSettingsFeatures loading={false} features={mockFeatures} cloudProvider="AWS" />)

    expect(screen.getByText('Deploy on an existing VPC')).toBeInTheDocument()
    expect(screen.getByText('EKS public subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MongoDB subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('Redis subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MySQL/PostgreSQL subnet IDs')).toBeInTheDocument()
  })
})
