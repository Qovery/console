import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { DatabaseCreateContext } from '../page-database-create-feature'
import StepGeneralFeature, { filterDatabaseTypes } from './step-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

const mockCluster = clusterFactoryMock(1)[0]
jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useCluster: () => ({ data: mockCluster }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
  useNavigate: () => mockNavigate,
}))

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          accessibility: DatabaseAccessibilityEnum.PRIVATE,
          version: '1',
          type: DatabaseTypeEnum.MYSQL,
          mode: DatabaseModeEnum.CONTAINER,
        },
        setGeneralData: mockSetGeneralData,
        resourcesData: undefined,
        setResourcesData: jest.fn(),
        creationFlowUrl: '/organization/1/project/2/environment/3/services/create/database',
      }}
    >
      {props.children}
    </DatabaseCreateContext.Provider>
  )
}

describe('StepGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    const submitButton = await screen.findByTestId('button-submit')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()
    waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.click(submitButton)

    expect(mockSetGeneralData).toHaveBeenCalledWith({
      name: 'test',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      version: '1',
      type: DatabaseTypeEnum.MYSQL,
      mode: DatabaseModeEnum.CONTAINER,
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/1/project/2/environment/3/services/create/database/resources'
    )
  })

  it('should return filtered array when not all databases are present in cluster vpc', () => {
    const databaseTypes = [
      { label: 'MONGODB', value: 'MONGODB' },
      { label: 'REDIS', value: 'REDIS' },
      { label: 'POSTGRESQL', value: 'POSTGRESQL' },
      { label: 'MYSQL', value: 'MYSQL' },
    ]

    const clusterVpc = {
      aws_vpc_eks_id: 'vpc-1',
      eks_subnets_zone_a_ids: [],
      eks_subnets_zone_b_ids: [],
      eks_subnets_zone_c_ids: [],
      eks_karpenter_fargate_subnets_zone_a_ids: [],
      eks_karpenter_fargate_subnets_zone_b_ids: [],
      eks_karpenter_fargate_subnets_zone_c_ids: [],
      documentdb_subnets_zone_a_ids: [],
      documentdb_subnets_zone_b_ids: [],
      documentdb_subnets_zone_c_ids: [],
      elasticache_subnets_zone_a_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
      elasticache_subnets_zone_b_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
      elasticache_subnets_zone_c_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
      rds_subnets_zone_a_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
      rds_subnets_zone_b_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
      rds_subnets_zone_c_ids: ['subnet-1', 'subnet-2', 'subnet-3'],
    }

    const filteredTypes = filterDatabaseTypes(databaseTypes, clusterVpc)

    // Expect only MYSQL, POSTGRESQL and REDIS to be present in the filtered array
    expect(filteredTypes).toEqual([
      { label: 'REDIS', value: 'REDIS' },
      { label: 'POSTGRESQL', value: 'POSTGRESQL' },
      { label: 'MYSQL', value: 'MYSQL' },
    ])
  })

  it('should return filtered array when none of the databases are present in cluster vpc', () => {
    const databaseTypes = [
      { label: 'MONGODB', value: 'MONGODB' },
      { label: 'REDIS', value: 'REDIS' },
      { label: 'POSTGRESQL', value: 'POSTGRESQL' },
      { label: 'MYSQL', value: 'MYSQL' },
    ]

    const clusterVpc = {
      aws_vpc_eks_id: 'vpc-1',
      eks_subnets_zone_a_ids: [],
      eks_subnets_zone_b_ids: [],
      eks_subnets_zone_c_ids: [],
      eks_karpenter_fargate_subnets_zone_a_ids: [],
      eks_karpenter_fargate_subnets_zone_b_ids: [],
      eks_karpenter_fargate_subnets_zone_c_ids: [],
      documentdb_subnets_zone_a_ids: [],
      documentdb_subnets_zone_b_ids: [],
      documentdb_subnets_zone_c_ids: [],
      elasticache_subnets_zone_a_ids: [],
      elasticache_subnets_zone_b_ids: [],
      elasticache_subnets_zone_c_ids: [],
      rds_subnets_zone_a_ids: [],
      rds_subnets_zone_b_ids: [],
      rds_subnets_zone_c_ids: [],
    }

    const filteredTypes = filterDatabaseTypes(databaseTypes, clusterVpc)

    expect(filteredTypes).toEqual([])
  })
})
