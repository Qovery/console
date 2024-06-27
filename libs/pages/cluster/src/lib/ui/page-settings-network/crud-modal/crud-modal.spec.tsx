import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModal, { type CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  route: {
    destination: '10.0.0.0/20',
    target: 'target',
    description: 'desc',
  },
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { destination: '10.0.0.0/20', target: 'target', description: 'desc' },
      })
    )

    screen.getByDisplayValue('10.0.0.0/20')
    screen.getByDisplayValue('target')
    screen.getByDisplayValue('desc')
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { destination: '10.0.0.0/20', target: 'target', description: 'desc' },
      })
    )

    const button = await screen.findByTestId('submit-button')
    await userEvent.click(button)
    expect(button).toBeEnabled()
    expect(spy).toHaveBeenCalled()
  })
})
