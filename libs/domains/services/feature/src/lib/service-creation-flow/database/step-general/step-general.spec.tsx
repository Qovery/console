import {
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
  DatabaseAccessibilityEnum,
  type DatabaseConfiguration,
  DatabaseModeEnum,
  DatabaseTypeEnum,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseCreationFlow, useDatabaseCreateContext } from '../database-creation-flow'
import { DatabaseStepGeneral } from './step-general'

const mockOnSubmit = jest.fn()
const mockSearch = {
  template: 'postgresql',
  option: 'container',
}

const clusterVpc = {
  aws_vpc_eks_id: 'vpc-1',
  elasticache_subnets_zone_a_ids: ['subnet-1'],
  elasticache_subnets_zone_b_ids: ['subnet-2'],
  elasticache_subnets_zone_c_ids: ['subnet-3'],
  rds_subnets_zone_a_ids: ['subnet-1'],
  rds_subnets_zone_b_ids: ['subnet-2'],
  rds_subnets_zone_c_ids: ['subnet-3'],
  documentdb_subnets_zone_a_ids: [],
  documentdb_subnets_zone_b_ids: [],
  documentdb_subnets_zone_c_ids: [],
  eks_create_nodes_in_private_subnet: false,
  eks_subnets_zone_a_ids: [],
  eks_subnets_zone_b_ids: [],
  eks_subnets_zone_c_ids: [],
  eks_karpenter_fargate_subnets_zone_a_ids: [],
  eks_karpenter_fargate_subnets_zone_b_ids: [],
  eks_karpenter_fargate_subnets_zone_c_ids: [],
} as ClusterFeatureAwsExistingVpc

const cluster = {
  id: 'cluster-1',
  kubernetes: 'EKS',
} as Cluster

const databaseConfigurations = [
  {
    database_type: 'POSTGRESQL',
    version: [
      { name: '16', supported_mode: 'CONTAINER' },
      { name: '15', supported_mode: 'MANAGED' },
    ],
  },
] as DatabaseConfiguration[]

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => jest.fn(),
  useSearch: () => mockSearch,
}))

function FormInitializer() {
  const { generalForm } = useDatabaseCreateContext()

  useEffect(() => {
    generalForm.setValue('name', 'postgres', { shouldValidate: true })
    generalForm.setValue('type', DatabaseTypeEnum.POSTGRESQL, { shouldValidate: true })
    generalForm.setValue('mode', DatabaseModeEnum.CONTAINER, { shouldValidate: true })
    generalForm.setValue('version', '16', { shouldValidate: true })
    generalForm.setValue('accessibility', DatabaseAccessibilityEnum.PRIVATE, { shouldValidate: true })
  }, [generalForm])

  return null
}

describe('DatabaseStepGeneral', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders successfully with database sections', () => {
    renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <DatabaseStepGeneral
          onSubmit={mockOnSubmit}
          labelSetting={<div data-testid="label-setting">Labels</div>}
          annotationSetting={<div data-testid="annotation-setting">Annotations</div>}
          cloudProvider="AWS"
          cluster={cluster}
          clusterVpc={clusterVpc}
          databaseConfigurations={databaseConfigurations}
        />
      </DatabaseCreationFlow>
    )

    expect(screen.getByRole('heading', { name: 'PostgreSQL - Container' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database mode' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database configuration' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('submits the form when required values are present', async () => {
    const { userEvent } = renderWithProviders(
      <DatabaseCreationFlow creationFlowUrl="/create/database">
        <FormInitializer />
        <DatabaseStepGeneral
          onSubmit={mockOnSubmit}
          labelSetting={<div>Labels</div>}
          annotationSetting={<div>Annotations</div>}
          cloudProvider="AWS"
          cluster={cluster}
          clusterVpc={clusterVpc}
          databaseConfigurations={databaseConfigurations}
        />
      </DatabaseCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'postgres',
        type: DatabaseTypeEnum.POSTGRESQL,
        mode: DatabaseModeEnum.CONTAINER,
        version: '16',
      })
    )
  })
})
