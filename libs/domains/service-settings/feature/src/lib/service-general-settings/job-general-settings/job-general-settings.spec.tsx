import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum } from 'qovery-typescript-axios'
import { cronjobFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { JobGeneralSettings } from './job-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  AnnotationSetting: () => null,
  EditGitRepositorySettings: () => null,
  GitRepositorySettings: () => null,
  LabelSetting: () => null,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  AutoDeploySection: () => null,
  EntrypointCmdInputs: () => null,
  GeneralContainerSettings: () => null,
  GeneralSetting: () => null,
  JobGeneralSettings: () => null,
}))

describe('JobGeneralSettings', () => {
  const service = cronjobFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <JobGeneralSettings
          service={service}
          organization={organization}
          openContainerRegistryCreateEditModal={jest.fn()}
        />,
        {
          defaultValues: {
            name: service.name,
            build_mode: BuildModeEnum.DOCKER,
            dockerfile_path: 'Dockerfile',
          },
        }
      )
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
  })
})
