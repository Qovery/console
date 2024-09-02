import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ToastEnum } from '../../utils/toast'
import ToastBehavior, { ToastContent, type ToastProps } from './toast'

const props: ToastProps = {
  status: ToastEnum.SUCCESS,
}

describe('Toast', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ToastBehavior />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a toast content', () => {
    props.status = ToastEnum.SUCCESS
    const { baseElement } = renderWithProviders(ToastContent(props.status))
    expect(baseElement).toBeTruthy()
  })

  it('should have a error icon', () => {
    props.status = ToastEnum.ERROR
    renderWithProviders(ToastContent(props.status))

    const toast = screen.queryByTestId('toast') as HTMLDivElement

    expect(toast.querySelector('span')?.classList).toContain('icon-solid-circle-exclamation')
  })

  it('should have a title', () => {
    props.title = 'my-title'

    renderWithProviders(ToastContent(props.status, undefined, props.title))

    const toastTitle = screen.queryByTestId('toast-title') as HTMLParagraphElement

    expect(toastTitle?.textContent).toBe('my-title')
  })

  it('should have a description', () => {
    props.description = 'my-description'

    renderWithProviders(ToastContent(props.status, undefined, '', props.description))

    const toastTitle = screen.queryByTestId('toast-description') as HTMLParagraphElement

    expect(toastTitle?.textContent).toBe('my-description')
  })

  it('should render with a label and no icon', async () => {
    props.description = 'my-description'
    props.externalLink = 'https://my-link.com'
    props.actionLabel = 'my-label'

    const spy = jest.fn()
    window.open = jest.fn((url: string, target: string) => ({}))

    const { userEvent } = renderWithProviders(
      ToastContent(
        props.status,
        undefined,
        '',
        props.description,
        spy,
        undefined,
        props.actionLabel,
        props.externalLink
      )
    )

    const labelActionButton = screen.queryByTestId('label-action') as HTMLElement

    expect(labelActionButton).toHaveTextContent('my-label')

    await userEvent.click(labelActionButton)

    expect(spy).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('https://my-link.com', '_blank')
  })
})
