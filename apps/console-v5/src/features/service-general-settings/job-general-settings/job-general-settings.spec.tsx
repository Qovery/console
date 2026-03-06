import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum } from 'qovery-typescript-axios'
import { cronjobFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { JobGeneralSettings } from './job-general-settings'

describe('JobGeneralSettings', () => {
  const service = cronjobFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <JobGeneralSettings
          service={service}
          organizationId="org-id"
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
