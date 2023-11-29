import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { HelmRepositoryKindEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModal, type CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  availableHelmRepositories: [
    {
      kind: HelmRepositoryKindEnum.HTTPS,
    },
  ],
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with HTTPS', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://helm-charts.io',
          kind: HelmRepositoryKindEnum.HTTPS,
          config: {
            login: 'test',
            password: 'password',
          },
        },
      })
    )

    const submitButton = await screen.findByRole('button', { name: /Create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://helm-charts.io')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('password')
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://qovery.com',
          kind: HelmRepositoryKindEnum.HTTPS,
          config: {
            login: 'test',
            password: 'password',
          },
        },
      })
    )

    const button = await screen.findByRole('button', { name: /Create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()

    expect(button).not.toBeDisabled()
    await userEvent.click(button)
    expect(spy).toHaveBeenCalled()
  })
})
