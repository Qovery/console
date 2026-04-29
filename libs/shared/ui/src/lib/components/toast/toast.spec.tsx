import { toast as sonnerToast } from 'sonner'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { toast } from '../../utils/toast'
import ToastBehavior from './toast'

describe('Toast', () => {
  beforeAll(() => {
    // jsdom does not implement pointer capture, which sonner uses for swipe-to-dismiss.
    window.HTMLElement.prototype.setPointerCapture = jest.fn()
    window.HTMLElement.prototype.releasePointerCapture = jest.fn()
    window.HTMLElement.prototype.hasPointerCapture = jest.fn()
  })

  afterEach(() => {
    sonnerToast.dismiss()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ToastBehavior />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a title and a description', async () => {
    renderWithProviders(<ToastBehavior />)

    toast('success', 'my-title', 'my-description')

    expect(await screen.findByText('my-title')).toBeInTheDocument()
    expect(await screen.findByText('my-description')).toBeInTheDocument()
  })

  it('should render a success icon', async () => {
    const { baseElement } = renderWithProviders(<ToastBehavior />)

    toast('success', 'my-title')

    await screen.findByText('my-title')
    expect(baseElement.querySelector('i.fa-regular.fa-circle-check')).toBeInTheDocument()
  })

  it('should render an error icon', async () => {
    const { baseElement } = renderWithProviders(<ToastBehavior />)

    toast('error', 'my-title')

    await screen.findByText('my-title')
    expect(baseElement.querySelector('i.fa-regular.fa-circle-xmark')).toBeInTheDocument()
  })

  it('should render a warning icon', async () => {
    const { baseElement } = renderWithProviders(<ToastBehavior />)

    toast('warning', 'my-title')

    await screen.findByText('my-title')
    expect(baseElement.querySelector('i.fa-regular.fa-triangle-exclamation')).toBeInTheDocument()
  })

  it('should render an action button when label action is provided', async () => {
    renderWithProviders(<ToastBehavior />)

    toast('success', 'my-title', 'my-description', undefined, 'Undo')

    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('should call the callback and dismiss the toast when the action button is clicked', async () => {
    const callback = jest.fn()
    const { userEvent } = renderWithProviders(<ToastBehavior />)

    toast('success', 'my-title', 'my-description', callback, 'Undo')

    const actionButton = await screen.findByRole('button', { name: 'Undo' })
    await userEvent.click(actionButton)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should dismiss the toast when the close button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ToastBehavior />)

    toast('success', 'my-title')

    const closeButton = await screen.findByRole('button', { name: 'Close toast' })
    await userEvent.click(closeButton)

    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(screen.queryByText('my-title')).not.toBeInTheDocument()
  })
})
