import { act } from '__tests__/utils/setup-jest'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with Docker', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'description',
        },
      })
    )
    await act(() => {
      getByDisplayValue('test')
      getByDisplayValue('description')
    })
  })
})
