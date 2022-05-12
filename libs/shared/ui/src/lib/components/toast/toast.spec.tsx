import { ToastEnum } from '@console/shared/ui'
import { screen, render } from '__tests__/utils/setup-jest'
import ToastBehavior, { ToastContent, ToastProps } from './toast'

let props: ToastProps
props = {
  status: ToastEnum.SUCCESS,
}

describe('Toast', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ToastBehavior />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a toast content', () => {
    props.status = ToastEnum.SUCCESS
    const { baseElement } = render(ToastContent(props.status))
    expect(baseElement).toBeTruthy()
  })

  it('should have a className toast error', () => {
    props.status = ToastEnum.ERROR
    render(ToastContent(props.status))

    const toast = screen.queryByTestId('toast') as HTMLDivElement

    expect(toast.classList).toContain('toast--error')
  })

  it('should have a title', () => {
    props.title = 'my-title'

    render(ToastContent(props.status, undefined, props.title))

    const toastTitle = screen.queryByTestId('toast-title') as HTMLParagraphElement

    expect(toastTitle?.textContent).toBe('my-title')
  })

  it('should have a description', () => {
    props.description = 'my-description'

    render(ToastContent(props.status, undefined, '', props.description))

    const toastTitle = screen.queryByTestId('toast-description') as HTMLParagraphElement

    expect(toastTitle?.textContent).toBe('my-description')
  })
})
