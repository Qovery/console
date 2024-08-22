import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { InputDropdownVariables, type InputDropdownVariablesProps } from './input-suggestions-variables'

const props: InputDropdownVariablesProps = {
  environmentId: '000',
  controller: {
    field: {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: '',
    },
    fieldState: { error: '' },
    formState: { errors: {} },
  },
}

jest.mock('../hooks/use-variables/use-variables', () => ({
  useVariables: () => ({
    data: [
      {
        id: 'c0277184-1fe0-4f17-b09a-58eee2c05701',
        created_at: '2023-10-25T09:13:34.723567Z',
        updated_at: '2023-10-25T09:13:34.723568Z',
        key: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
        value: 'app-z04308de2-back-end',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '04308de2-af27-405f-9e95-570fa94ed577',
        service_name: 'back-end-A',
        service_type: 'CONTAINER',
        owned_by: 'QOVERY',
        description: 'test',
        is_secret: false,
      },
    ],
  }),
}))

describe('InputDropdownVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputDropdownVariables {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render dropdown content when clicked', async () => {
    const { userEvent } = renderWithProviders(<InputDropdownVariables {...props} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const dropdownContent = await screen.findByRole('menu')

    expect(dropdownContent).toMatchSnapshot()
  })
})
