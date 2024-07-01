import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import AWSExistingVPC, { type AWSExistingVPCProps } from './aws-existing-vpc'

const feature = {
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

describe('AWSExistingVPC', () => {
  const props: AWSExistingVPCProps = {
    feature,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AWSExistingVPC {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('renders with existing VPC data', () => {
    renderWithProviders(<AWSExistingVPC {...props} />)

    expect(screen.getByText('Deploy on an existing VPC')).toBeInTheDocument()
    expect(screen.getByText('EKS public subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MongoDB subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('Redis subnet IDs')).toBeInTheDocument()
    expect(screen.getByText('MySQL/PostgreSQL subnet IDs')).toBeInTheDocument()
  })
})
