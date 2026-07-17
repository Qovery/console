import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { organizationFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TerraformGeneralSettings } from './terraform-general-settings'

const mockNavigate = jest.fn()
const mockUseBlueprintUpdate = jest.fn()
const mockEditGitRepositorySettings = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    organizationId: 'organization-id',
    projectId: 'project-id',
    environmentId: 'environment-id',
    serviceId: 'service-id',
  }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  EditGitRepositorySettings: (props: unknown) => {
    mockEditGitRepositorySettings(props)
    return null
  },
}))

jest.mock('@qovery/domains/services/feature', () => ({
  AutoDeploySection: () => null,
  GeneralSetting: () => null,
  useBlueprintUpdate: (props: unknown) => mockUseBlueprintUpdate(props),
}))

describe('TerraformGeneralSettings', () => {
  const service = terraformFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<TerraformGeneralSettings service={service} organization={organization} />, {
        defaultValues: {
          name: service.name,
          terraform_action: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
        },
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Build and deploy')).toBeInTheDocument()
  })

  it('shows the major version signal and blueprint update callout for blueprint services', async () => {
    mockUseBlueprintUpdate.mockReturnValue({
      data: {
        is_up_to_date: false,
        new_major_versions: [{ service_version: '17', latest_tag: 'aws/postgres/17/1.0.0' }],
      },
    })

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <TerraformGeneralSettings service={{ ...service, blueprint_id: 'blueprint-id' }} organization={organization} />,
        {
          defaultValues: {
            name: service.name,
            terraform_action: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
          },
        }
      )
    )

    expect(screen.getByRole('button', { name: 'New major version available' })).toBeInTheDocument()
    expect(screen.getByText('New blueprint version available')).toBeInTheDocument()
    expect(mockEditGitRepositorySettings).toHaveBeenCalledWith(
      expect.objectContaining({ showEditAction: false })
    )

    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint',
      params: {
        organizationId: 'organization-id',
        projectId: 'project-id',
        environmentId: 'environment-id',
        serviceId: 'service-id',
      },
    })
  })

  it('allows editing the Git repository for non-blueprint services', () => {
    renderWithProviders(
      wrapWithReactHookForm(<TerraformGeneralSettings service={service} organization={organization} />, {
        defaultValues: {
          name: service.name,
          terraform_action: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
        },
      })
    )

    expect(mockEditGitRepositorySettings).toHaveBeenCalledWith(expect.objectContaining({ showEditAction: true }))
  })

  it('hides blueprint update signals when the blueprint is up to date', () => {
    mockUseBlueprintUpdate.mockReturnValue({
      data: {
        is_up_to_date: true,
        new_major_versions: [],
      },
    })

    renderWithProviders(
      wrapWithReactHookForm(
        <TerraformGeneralSettings service={{ ...service, blueprint_id: 'blueprint-id' }} organization={organization} />,
        {
          defaultValues: {
            name: service.name,
            terraform_action: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
          },
        }
      )
    )

    expect(screen.queryByText('New major version available')).not.toBeInTheDocument()
    expect(screen.queryByText('New blueprint version available')).not.toBeInTheDocument()
  })

  it('still renders the blueprint update callout when an older API response omits major versions', () => {
    mockUseBlueprintUpdate.mockReturnValue({
      data: {
        is_up_to_date: false,
      },
    })

    renderWithProviders(
      wrapWithReactHookForm(
        <TerraformGeneralSettings service={{ ...service, blueprint_id: 'blueprint-id' }} organization={organization} />,
        {
          defaultValues: {
            name: service.name,
            terraform_action: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
          },
        }
      )
    )

    expect(screen.queryByText('New major version available')).not.toBeInTheDocument()
    expect(screen.getByText('New blueprint version available')).toBeInTheDocument()
  })
})
