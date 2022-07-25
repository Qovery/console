import CrudEnvironmentVariableModalFeature, {
  CrudEnvironmentVariableModalFeatureProps,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from './crud-environment-variable-modal-feature'
import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@console/domains/environment-variable'
import { act, fireEvent, screen } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'

const props: CrudEnvironmentVariableModalFeatureProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  type: EnvironmentVariableType.ALIAS,
  projectId: 'dsd',
  applicationId: 'sds',
  environmentId: 'sds',
  variable: mockEnvironmentVariable(),
  setOpen: jest.fn(),
}

describe('CrudEnvironmentVariableModalFeature', () => {
  let baseElement: any
  let defaultValues: any

  beforeEach(() => {
    defaultValues = {
      key: '',
      scope: '',
      value: '',
      isSecret: false,
    }
  })

  it('should render successfully', () => {
    baseElement = render(wrapWithReactHookForm(<CrudEnvironmentVariableModalFeature {...props} />, { defaultValues }))

    expect(baseElement).toBeTruthy()
  })

  it('it should remove required for value if type is alias', async () => {
    props.type = EnvironmentVariableType.OVERRIDE
    render(wrapWithReactHookForm(<CrudEnvironmentVariableModalFeature {...props} />, { defaultValues }))

    const textarea = screen.getByLabelText('Value') as HTMLTextAreaElement

    // todo this is not working because not triggering the error message to appear
    act(() => {
      fireEvent.change(textarea, { target: { value: 'SDSD' } })
    })

    const submitButton = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement
  })
})
