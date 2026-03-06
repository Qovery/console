import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TerraformGeneralSettings } from './terraform-general-settings'

describe('TerraformGeneralSettings', () => {
  const service = terraformFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<TerraformGeneralSettings service={service} organizationId="org-id" />, {
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
})
