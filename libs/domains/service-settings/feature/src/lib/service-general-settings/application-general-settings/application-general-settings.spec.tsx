import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationGeneralSettings } from './application-general-settings'

describe('ApplicationGeneralSettings', () => {
  const service = applicationFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ApplicationGeneralSettings service={service} organizationId="org-id" />, {
        defaultValues: {
          name: service.name,
          build_mode: BuildModeEnum.DOCKER,
          dockerfile_path: service.dockerfile_path ?? 'Dockerfile',
        },
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Build and deploy')).toBeInTheDocument()
  })
})
