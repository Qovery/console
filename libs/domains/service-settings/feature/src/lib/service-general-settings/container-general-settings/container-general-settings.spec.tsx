import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { containerFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ContainerGeneralSettings } from './container-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  AnnotationSetting: () => null,
  LabelSetting: () => null,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  AutoDeploySection: () => null,
  GeneralContainerSettings: () => null,
  GeneralSetting: () => null,
}))

jest.mock('@qovery/shared/console-shared', () => ({
  EntrypointCmdInputs: () => null,
}))

describe('ContainerGeneralSettings', () => {
  const service = containerFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ContainerGeneralSettings
          service={service}
          organization={organization}
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
