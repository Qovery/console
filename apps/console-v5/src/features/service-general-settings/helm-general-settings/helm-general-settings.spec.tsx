import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmGeneralSettings } from './helm-general-settings'

describe('HelmGeneralSettings', () => {
  const service = helmFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<HelmGeneralSettings service={service} organizationId="org-id" />, {
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
