import {
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
  DatabaseAccessibilityEnum,
  type DatabaseConfiguration,
  DatabaseModeEnum,
  DatabaseTypeEnum,
} from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type DatabaseCreateGeneralData, type DatabaseCreateResourcesData } from '../database-create-utils'
import {
  DatabaseCreateContext,
  type DatabaseCreateContextInterface,
  defaultDatabaseResourcesData,
} from '../database-creation-flow'
import { DatabaseStepGeneral } from './step-general'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()
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

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, as: As = 'a', ...props }: { children?: ReactNode; as?: string; [key: string]: unknown }) =>
    As === 'button' ? (
      <button type="button" {...props}>
        {children}
      </button>
    ) : (
      <a {...props}>{children}</a>
    ),
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

interface TestProviderProps {
  children: ReactNode
  generalValues?: Partial<DatabaseCreateGeneralData>
  resourcesValues?: Partial<DatabaseCreateResourcesData>
}

function TestProvider({ children, generalValues, resourcesValues }: TestProviderProps) {
  const generalForm = useForm<DatabaseCreateGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      icon_uri: 'app://qovery-console/postgresql',
      mode: DatabaseModeEnum.CONTAINER,
      type: DatabaseTypeEnum.POSTGRESQL,
      version: '',
      labels_groups: [],
      annotations_groups: [],
      ...generalValues,
    },
  })

  const resourcesForm = useForm<DatabaseCreateResourcesData>({
    mode: 'onChange',
    defaultValues: {
      ...defaultDatabaseResourcesData,
      ...resourcesValues,
    },
  })

  const value: DatabaseCreateContextInterface = {
    currentStep: 1,
    setCurrentStep: mockSetCurrentStep,
    creationFlowUrl: '/organization/org-1/project/proj-1/environment/env-1/service/create/database',
    generalForm,
    resourcesForm,
  }

  return <DatabaseCreateContext.Provider value={value}>{children}</DatabaseCreateContext.Provider>
}

function renderComponent({
  generalValues,
  resourcesValues,
}: {
  generalValues?: Partial<DatabaseCreateGeneralData>
  resourcesValues?: Partial<DatabaseCreateResourcesData>
} = {}) {
  return renderWithProviders(
    <TestProvider generalValues={generalValues} resourcesValues={resourcesValues}>
      <DatabaseStepGeneral
        onSubmit={mockOnSubmit}
        labelSetting={<div data-testid="label-setting">Labels</div>}
        annotationSetting={<div data-testid="annotation-setting">Annotations</div>}
        cloudProvider="AWS"
        cluster={cluster}
        clusterVpc={clusterVpc}
        databaseConfigurations={databaseConfigurations}
      />
    </TestProvider>
  )
}

describe('DatabaseStepGeneral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders successfully with database sections', () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'PostgreSQL - Container' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database mode' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database configuration' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('submits the form when required values are present', async () => {
    renderComponent({
      generalValues: {
        name: 'postgres',
        type: DatabaseTypeEnum.POSTGRESQL,
        mode: DatabaseModeEnum.CONTAINER,
        version: '16',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
      },
    })
    ;(document.querySelector('form') as HTMLFormElement).requestSubmit()

    await waitFor(() => {
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
})
