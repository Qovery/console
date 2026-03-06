import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { containerFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ContainerGeneralSettings } from './container-general-settings'

describe('ContainerGeneralSettings', () => {
  const service = containerFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ContainerGeneralSettings
          service={service}
          organizationId="org-id"
          openContainerRegistryCreateEditModal={jest.fn()}
        />,
        {
          defaultValues: {
            name: service.name,
          },
        }
      )
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })
})
