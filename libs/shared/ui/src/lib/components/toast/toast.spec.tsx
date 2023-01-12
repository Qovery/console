import { act } from '@testing-library/react'
import { render, screen } from '__tests__/utils/setup-jest'
import { ToastEnum } from '../../utils/toast'
import ToastBehavior, { ToastContent, ToastProps } from './toast'

const props: ToastProps = {
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

  it('should have a error icon', () => {
    props.status = ToastEnum.ERROR
    render(ToastContent(props.status))

    const toast = screen.queryByTestId('toast') as HTMLDivElement

    expect(toast.querySelector('.toast__icon span')?.classList).toContain('icon-solid-circle-exclamation')
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

  it('should render with a label and no icon', () => {
    props.description = 'my-description'
    props.externalLink = 'https://my-link.com'
    props.actionLabel = 'my-label'

    const spy = jest.fn()
    window.open = jest.fn((url: string, target: string) => ({}))

    render(
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

    expect(labelActionButton.textContent).toBe('my-label')

    act(() => {
      labelActionButton.click()
    })

    expect(spy).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('https://my-link.com', '_blank')
  })
})
