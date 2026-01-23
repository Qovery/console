import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import * as servicesDomain from '@qovery/domains/services/feature'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsTerraformArgumentsFeature } from './page-settings-terraform-arguments-feature'

const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  DropdownVariable: ({ children, onChange }: any) => (
    <div data-testid="dropdown-variable" onClick={() => onChange('MY_VARIABLE')}>
      {children}
    </div>
  ),
}))

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
    useServiceSpy.mockReturnValue({
      data: mockService,
      isFetched: true,
      isLoading: false,
    })
    useEditServiceSpy.mockReturnValue({
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
            root_path: mockService.terraform_files_source?.git?.git_repository?.root_path ?? '',
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

  it('should render variable interpolation wand button for each command', () => {
    renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))

    // Check that the wand button appears for each terraform command
    const wandButtons = screen.getAllByTestId('dropdown-variable')
    expect(wandButtons).toHaveLength(5) // init, validate, plan, apply, destroy
  })

  it('should add variable interpolation to empty input when wand is clicked', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))

    const inputLabelForPlan = screen.getByText('Arguments for plan')
    const inputForPlan = inputLabelForPlan.closest('div')?.querySelector('input')
    expect(inputForPlan).toHaveValue('')

    const wandButtons = screen.getAllByTestId('dropdown-variable')
    const wandButtonForPlan = wandButtons[2]

    // Click the wand button to add a variable
    await userEvent.click(wandButtonForPlan)

    // Check that the variable was added with correct interpolation syntax
    expect(inputForPlan).toHaveValue('{{MY_VARIABLE}}')
  })

  it('should append variable interpolation to existing input when wand is clicked', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))

    // Get the input for init command (which has default value '-auto-approve')
    const inputLabelForInit = screen.getByText('Arguments for init')
    const inputForInit = inputLabelForInit.closest('div')?.querySelector('input')
    expect(inputForInit).toHaveValue('-auto-approve')

    // Find the wand button for the init input (1st command)
    const wandButtons = screen.getAllByTestId('dropdown-variable')
    const wandButtonForInit = wandButtons[0]

    // Click the wand button to add a variable
    await userEvent.click(wandButtonForInit)

    // Check that the variable was appended to existing value with space delimiter
    expect(inputForInit).toHaveValue('-auto-approve {{MY_VARIABLE}}')
  })

  it('should correctly submit form with variable interpolation', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<PageSettingsTerraformArgumentsFeature />))

    // Get the apply input and add a variable using the wand
    const inputLabelForApply = screen.getByText('Arguments for apply')
    const inputForApply = inputLabelForApply.closest('div')?.querySelector('input')
    const wandButtons = screen.getAllByTestId('dropdown-variable')
    const wandButtonForApply = wandButtons[3] // 0=init, 1=validate, 2=plan, 3=apply

    // Add some text first
    if (inputForApply) {
      await userEvent.type(inputForApply, '-auto-approve')
    }

    // Click the wand button to add a variable
    await userEvent.click(wandButtonForApply)

    // Submit the form
    const submitButton = screen.getByText('Save')
    await userEvent.click(submitButton)

    // Verify that the variable interpolation is correctly submitted
    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: mockService.id,
      payload: {
        ...mockService,
        terraform_files_source: {
          git_repository: {
            url: mockService.terraform_files_source?.git?.git_repository?.url ?? '',
            branch: mockService.terraform_files_source?.git?.git_repository?.branch ?? '',
            git_token_id: mockService.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
            root_path: mockService.terraform_files_source?.git?.git_repository?.root_path ?? '',
          },
        },
        action_extra_arguments: {
          init: ['-auto-approve'],
          validate: [],
          plan: [],
          apply: ['-auto-approve', '{{MY_VARIABLE}}'],
          destroy: ['bye'],
        },
      },
    })
  })
})
