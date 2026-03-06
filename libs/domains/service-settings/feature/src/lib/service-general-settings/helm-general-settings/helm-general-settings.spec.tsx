import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { helmFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmGeneralSettings } from './helm-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  EditGitRepositorySettings: () => null,
}))

jest.mock('@qovery/domains/service-helm/feature', () => ({
  DeploymentSetting: () => null,
  SourceSetting: () => null,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  AutoDeploySection: () => null,
  GeneralSetting: () => null,
}))

describe('HelmGeneralSettings', () => {
  const service = helmFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<HelmGeneralSettings service={service} organization={organization} />, {
        defaultValues: {
          name: service.name,
          source_provider: 'GIT',
        },
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })
})
