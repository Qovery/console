import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsTerraformArgumentsFeature } from './page-settings-terraform-arguments-feature'

jest.mock('@qovery/domains/services/feature')

// Mocking the Terraform service
const mockService = terraformFactoryMock(1)[0]
mockService.action_extra_arguments = {
  init: ['-auto-approve'],
  validate: [],
  plan: [],
  apply: [],
  destroy: ['bye'],
}
const mockEditService = jest.fn()

describe('PageSettingsTerraformArgumentsFeature', () => {
  beforeEach(() => {
    useService.mockReturnValue({
      data: mockService,
      isFetched: true,
      isLoading: false,
    })
    useEditService.mockReturnValue({
      mutate: mockEditService,
      isLoading: false,
    })
  })

  it('should render', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))
    expect(baseElement).toBeTruthy()
  })

  it('should correctly submit the form', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))
    const submitButton = screen.getByText('Save')
    const inputLabelForApply = screen.getByText('Arguments for apply')
    const inputLabelForDestroy = screen.getByText('Arguments for destroy')
    const inputForApply = inputLabelForApply.closest('div')?.querySelector('input')
    const inputForDestroy = inputLabelForDestroy.closest('div')?.querySelector('input')

    // Typing the input for apply
    if (inputForApply) {
      await userEvent.type(inputForApply, 'hello world')
    }

    // Clearing the input for destroy
    if (inputForDestroy) {
      await userEvent.clear(inputForDestroy)
    }

    await userEvent.click(submitButton)

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: mockService.id,
      payload: {
        ...mockService,
        terraform_files_source: {
          git_repository: {
            url: mockService.terraform_files_source?.git?.git_repository?.url ?? '',
            branch: mockService.terraform_files_source?.git?.git_repository?.branch ?? '',
            git_token_id: mockService.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
          },
        },
        action_extra_arguments: {
          init: ['-auto-approve'],
          destroy: [], // Expected to be empty because the input for the "destroy" command was cleared
          apply: ['hello', 'world'], // Expected to be the value that was typed in the input for the "apply" command
          plan: [],
          validate: [],
        },
      },
    })
  })
})
