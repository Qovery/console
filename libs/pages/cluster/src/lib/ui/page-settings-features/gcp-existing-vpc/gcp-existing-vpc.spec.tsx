import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import GcpExistingVPC, { type GcpExistingVPCProps } from './gcp-existing-vpc'

const features = {
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
}

describe('GcpExistingVPC', () => {
  const props: GcpExistingVPCProps = {
    features,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<GcpExistingVPC {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('renders with existing VPC data', () => {
    renderWithProviders(<GcpExistingVPC {...props} />)

    expect(screen.getByText('Deploy on an existing VPC')).toBeInTheDocument()
    expect(screen.getByText('EKS subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MongoDB subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('Redis subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MySQL/PostgreSQL subnet IDs')).toBeInTheDocument()
  })
})
