import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ButtonPopoverSubnets from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets
          sections={[
            {
              title: 'EKS subnets',
              name: 'eks_subnets',
            },
          ]}
        >
          EKS
        </ButtonPopoverSubnets>
      )
    )
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', async () => {
    const { container, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets
          sections={[
            {
              title: 'EKS subnets',
              name: 'eks_subnets',
            },
          ]}
        >
          EKS
        </ButtonPopoverSubnets>,
        {
          defaultValues: {
            eks_subnets: [{ A: 'test', B: 'test', C: 'test' }],
          },
        }
      ),
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /eks/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with invalid state', async () => {
    const { container, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ButtonPopoverSubnets
          sections={[
            {
              title: 'EKS subnets',
              name: 'eks_subnets',
            },
          ]}
        >
          EKS
        </ButtonPopoverSubnets>,
        {
          defaultValues: {
            eks_subnets: [{ A: 'test', B: 'test', C: '' }],
          },
        }
      ),
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /eks/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })
})
