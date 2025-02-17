import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ButtonPopoverSubnets from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          {' '}
          <button>children</button>
        </ButtonPopoverSubnets>
      )
    )
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', async () => {
    const { container, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          <button>children</button>
        </ButtonPopoverSubnets>,
        {
          defaultValues: {
            aws_existing_vpc: {
              eks_subnets: [{ A: 'test', B: 'test', C: 'test' }],
            },
          },
        }
      ),
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /children/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with invalid state', async () => {
    const { container, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets disabled={false}>
          <button>children</button>
        </ButtonPopoverSubnets>,
        {
          defaultValues: {
            aws_existing_vpc: {
              eks_subnets: [{ A: 'test', B: 'test', C: '' }],
            },
          },
        }
      ),
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /children/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })
})
