import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { clusterFactoryMock, deploymentRulesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCreateDeploymentRule } from '../../hooks/use-create-deployment-rule/use-create-deployment-rule'
import { useDeploymentRule } from '../../hooks/use-deployment-rule/use-deployment-rule'
import { useEditDeploymentRule } from '../../hooks/use-edit-deployment-rule/use-edit-deployment-rule'
import {
  CreateDeploymentRule,
  CreateEditDeploymentRule,
  type CreateEditDeploymentRuleProps,
  EditDeploymentRule,
} from './create-edit-deployment-rule'

const mockNavigate = jest.fn()
const mockedParams = {
  organizationId: 'org-id',
  projectId: 'project-id',
  deploymentRuleId: '',
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => mockedParams,
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

jest.mock('../../hooks/use-create-deployment-rule/use-create-deployment-rule', () => ({
  useCreateDeploymentRule: jest.fn(),
}))

jest.mock('../../hooks/use-deployment-rule/use-deployment-rule', () => ({
  useDeploymentRule: jest.fn(),
}))

jest.mock('../../hooks/use-edit-deployment-rule/use-edit-deployment-rule', () => ({
  useEditDeploymentRule: jest.fn(),
}))

const useQueryMock = useQuery as jest.Mock
const useCreateDeploymentRuleMock = useCreateDeploymentRule as jest.Mock
const useDeploymentRuleMock = useDeploymentRule as jest.Mock
const useEditDeploymentRuleMock = useEditDeploymentRule as jest.Mock

describe('CreateEditDeploymentRule', () => {
  let props: CreateEditDeploymentRuleProps

  beforeEach(() => {
    jest.clearAllMocks()
    mockedParams.organizationId = 'org-id'
    mockedParams.projectId = 'project-id'
    mockedParams.deploymentRuleId = ''

    const deploymentRule = deploymentRulesFactoryMock(1)[0]
    deploymentRule.name = 'My rule'
    deploymentRule.start_time = '1970-01-01T08:00:00.000Z'
    deploymentRule.stop_time = '1970-01-01T19:00:00.000Z'
    deploymentRule.weekdays = ['MONDAY', 'TUESDAY']

    useQueryMock.mockReturnValue({
      data: clusterFactoryMock(2),
    })

    useCreateDeploymentRuleMock.mockReturnValue({
      mutateAsync: jest.fn(),
    })

    useDeploymentRuleMock.mockReturnValue({
      data: deploymentRule,
    })

    useEditDeploymentRuleMock.mockReturnValue({
      mutateAsync: jest.fn(),
    })

    props = {
      title: 'Create rule',
      btnLabel: 'Create',
      onSubmit: jest.fn(),
      clusters: clusterFactoryMock(2),
      control: undefined,
    }
  })

  it('should render form component successfully', () => {
    const Wrapper = () => {
      const { control } = useForm<{
        id: string
        name: string
        timezone: string
        start_time: string
        stop_time: string
        mode: string
        auto_stop: boolean
        description: string
        cluster_id: string
      }>()

      return <CreateEditDeploymentRule {...props} control={control} />
    }

    const { baseElement } = renderWithProviders(<Wrapper />)
    expect(baseElement).toBeTruthy()
  })

  it('should render CreateDeploymentRule successfully', () => {
    mockedParams.deploymentRuleId = ''
    const { baseElement } = renderWithProviders(<CreateDeploymentRule />)

    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Create rule' })).toBeInTheDocument()
  })

  it('should render EditDeploymentRule successfully', () => {
    mockedParams.deploymentRuleId = 'rule-id'
    const { baseElement } = renderWithProviders(<EditDeploymentRule />)

    expect(baseElement).toBeTruthy()
    expect(screen.getByText('Edit My rule')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit rule' })).toBeInTheDocument()
  })
})
