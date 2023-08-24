import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import TerraformExportModal, { type TerraformExportModalProps } from './terraform-export-modal'

const props: TerraformExportModalProps = {
  closeModal: jest.fn(),
  isLoading: false,
  onSubmit: jest.fn(),
}

describe('TerraformExportModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<TerraformExportModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit form on click on button', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<TerraformExportModal {...props} />))

    const submitButton = screen.getByRole('button', { name: /export/i })

    const toggle = screen.getByText(/export secrets/i)
    await userEvent.click(toggle)

    await userEvent.click(submitButton)
    expect(spy).toHaveBeenCalled()
  })
})
