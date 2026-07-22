import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { organizationFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TerraformGeneralSettings } from './terraform-general-settings'

const mockEditGitRepositorySettings = jest.fn()

jest.mock('@qovery/domains/organizations/feature', () => ({
  EditGitRepositorySettings: (props: unknown) => {
    mockEditGitRepositorySettings(props)
    return null
  },
}))

jest.mock('@qovery/domains/services/feature', () => ({
  AutoDeploySection: () => null,
  GeneralSetting: () => null,
}))

describe('TerraformGeneralSettings', () => {
  const service = terraformFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

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

  it('hides the source edit action for blueprint services', () => {
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

    expect(mockEditGitRepositorySettings).toHaveBeenLastCalledWith(expect.objectContaining({ showEditAction: false }))
  })
})
