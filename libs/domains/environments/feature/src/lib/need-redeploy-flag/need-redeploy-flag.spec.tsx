import { EnvironmentDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeployEnvironmentImport from '../hooks/use-deploy-environment/use-deploy-environment'
import * as useDeploymentStatusImport from '../hooks/use-deployment-status/use-deployment-status'
import NeedRedeployFlag from './need-redeploy-flag'

const useDeployEnvironmentSpy = jest.spyOn(useDeployEnvironmentImport, 'useDeployEnvironment') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: 'organization-id',
    projectId: 'project-id',
    environmentId: 'environment-id',
  }),
  useNavigate: () => jest.fn(),
}))

describe('NeedRedeployFlag', () => {
  beforeEach(() => {
    useDeployEnvironmentSpy.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })

    const { baseElement } = renderWithProviders(<NeedRedeployFlag />)
    expect(baseElement).toBeTruthy()
  })

  it('should render button with Deploy now', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    screen.getByRole('button', { name: 'Deploy now' })
  })

  it('should render button with Redeploy now', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.OUT_OF_DATE,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    screen.getByRole('button', { name: 'Redeploy now' })
  })

  it('should call the onSubmit function on button click', async () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.OUT_OF_DATE,
      },
    })

    const { userEvent } = renderWithProviders(<NeedRedeployFlag />)

    const button = screen.getByRole('button', { name: 'Redeploy now' })

    await userEvent.click(button)

    expect(useDeployEnvironmentSpy().mutate).toHaveBeenCalledWith({ environmentId: 'environment-id' })
  })

  it('should render environment is not running message when never deployed', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    expect(screen.getByText('Environment is not running')).toBeInTheDocument()
  })

  it('should render environment needs to be redeployed message when out of date', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.OUT_OF_DATE,
      },
    })

    renderWithProviders(<NeedRedeployFlag />)

    expect(
      screen.getByText(/Environment needs to be redeployed to apply the configuration changes/)
    ).toBeInTheDocument()
  })

  it('should return null when environment deployment status is up to date', () => {
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        deployment_status: EnvironmentDeploymentStatusEnum.UP_TO_DATE,
      },
    })

    const { container } = renderWithProviders(<NeedRedeployFlag />)
    expect(container).toBeEmptyDOMElement()
  })
})
