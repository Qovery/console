import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { containerFactoryMock, gitContainerFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsPreviewEnvironments } from './settings-preview-environments'

describe('PageSettingsPreviewEnvironments', () => {
  const imageContainer = { ...containerFactoryMock(1)[0], id: 'image-container' }
  const gitContainer = { ...gitContainerFactoryMock(1)[0], id: 'git-container' }

  const renderPage = () =>
    renderWithProviders(
      wrapWithReactHookForm(
        <PageSettingsPreviewEnvironments
          onSubmit={jest.fn()}
          services={[imageContainer, gitContainer]}
          loading={false}
          toggleAll={jest.fn()}
          toggleEnablePreview={jest.fn()}
        />,
        { defaultValues: { auto_preview: false, on_demand_preview: false } }
      )
    )

  it('should keep the preview toggle enabled for an image container', () => {
    renderPage()

    expect(screen.getByTestId('toggle-image-container')).toBeEnabled()
  })

  it('should disable the preview toggle with a note for a Git container', () => {
    renderPage()

    expect(screen.getByTestId('toggle-git-container')).toBeDisabled()
    expect(screen.getByText('Not available yet for Git containers')).toBeInTheDocument()
  })
})
