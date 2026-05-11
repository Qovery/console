import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationGeneralSettings } from './application-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  AnnotationSetting: () => null,
  EditGitRepositorySettings: () => null,
  LabelSetting: () => null,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  AutoDeploySection: () => null,
  EntrypointCmdInputs: () => null,
  GeneralSetting: () => null,
}))

describe('ApplicationGeneralSettings', () => {
  const service = applicationFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ApplicationGeneralSettings service={service} organization={organization} />, {
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
