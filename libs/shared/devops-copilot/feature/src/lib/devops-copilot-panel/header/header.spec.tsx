import * as Dialog from '@radix-ui/react-dialog'
import type { MutableRefObject, ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Header } from './header'

jest.mock('@qovery/shared/util-const', () => ({
  QOVERY_FEEDBACK_URL: 'https://feedback.qovery.com',
  QOVERY_FORUM_URL: 'https://forum.qovery.com',
}))

jest.mock('@qovery/shared/ui', () => {
  const React = require('react')
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Button: ({
      children,
      onClick,
      ...props
    }: {
      children?: ReactNode
      onClick?: () => void
      [key: string]: unknown
    }) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Icon: ({ iconName }: { iconName: string }) => <span>{iconName}</span>,
    Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
    DropdownMenu: {
      Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Trigger: ({ children }: { children: ReactNode }) => <>{children}</>,
      Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Item: ({ children, onClick, asChild }: { children: ReactNode; onClick?: () => void; asChild?: boolean }) => {
        if (asChild && React.isValidElement(children)) return children

        return (
          <button type="button" onClick={onClick}>
            {children}
          </button>
        )
      },
    },
  }
})

describe('Header', () => {
  const mockSetIsReadOnly = jest.fn()
  const mockSetExpand = jest.fn()
  const mockHandleOnClose = jest.fn()
  const mockSetThread = jest.fn()
  const mockSetThreadId = jest.fn()
  const mockSetIsLoading = jest.fn()
  const mockSetPlan = jest.fn()

  const defaultProps = {
    threadId: undefined,
    threads: [],
    currentThreadHistoryTitle: 'New conversation',
    userAccess: undefined,
    isReadOnly: true,
    setIsReadOnly: mockSetIsReadOnly,
    threadLength: 0,
    expand: false,
    setExpand: mockSetExpand,
    handleOnClose: mockHandleOnClose,
    controllerRef: { current: null } as MutableRefObject<AbortController | null>,
    setThread: mockSetThread,
    setThreadId: mockSetThreadId,
    setIsLoading: mockSetIsLoading,
    setPlan: mockSetPlan,
  }

  const renderHeader = (props = {}) =>
    renderWithProviders(
      <Dialog.Root open>
        <Header {...defaultProps} {...props} />
      </Dialog.Root>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the current conversation title', () => {
    renderHeader()
    expect(screen.getByText('New conversation')).toBeInTheDocument()
  })

  it('renders the thread title when a thread is selected', () => {
    renderHeader({
      threadId: 'thread-1',
      threads: [{ id: 'thread-1', title: 'My Custom Thread' }],
      currentThreadHistoryTitle: 'My Custom Thread',
    })

    expect(screen.getByText('My Custom Thread')).toBeInTheDocument()
  })

  it('shows and toggles read-only mode when allowed', async () => {
    const { userEvent } = renderHeader({ userAccess: { read_only: false }, isReadOnly: true })

    expect(screen.getByText('Read-only')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    await userEvent.click(buttons[0])

    expect(mockSetIsReadOnly).toHaveBeenCalledWith(false)
  })

  it('hides the read-only toggle once the thread has messages', () => {
    renderHeader({ userAccess: { read_only: false }, threadLength: 2 })

    expect(screen.queryByText('Read-only')).not.toBeInTheDocument()
    expect(screen.queryByText('Read-write')).not.toBeInTheDocument()
  })

  it('resets the conversation when clicking new chat', async () => {
    const abortController = new AbortController()
    const abortSpy = jest.spyOn(abortController, 'abort')

    const { userEvent } = renderHeader({
      controllerRef: { current: abortController } as MutableRefObject<AbortController | null>,
    })

    await userEvent.click(screen.getByRole('button', { name: 'New chat' }))

    expect(abortSpy).toHaveBeenCalled()
    expect(mockSetThread).toHaveBeenCalledWith([])
    expect(mockSetThreadId).toHaveBeenCalledWith(undefined)
    expect(mockSetIsLoading).toHaveBeenCalledWith(false)
    expect(mockSetPlan).toHaveBeenCalledWith([])
    expect(mockSetIsReadOnly).toHaveBeenCalledWith(true)
  })

  it('shows the history action only when the panel is not expanded', () => {
    const { rerender } = renderWithProviders(
      <Dialog.Root open>
        <Header {...defaultProps} expand={false} />
      </Dialog.Root>
    )

    expect(screen.getByRole('button', { name: 'Show history' })).toBeInTheDocument()

    rerender(
      <Dialog.Root open>
        <Header {...defaultProps} expand={true} />
      </Dialog.Root>
    )

    expect(screen.queryByRole('button', { name: 'Show history' })).not.toBeInTheDocument()
  })

  it('calls setExpand from the expand action', async () => {
    const { userEvent } = renderHeader({ expand: false })

    await userEvent.click(screen.getByRole('button', { name: 'expand' }))

    expect(mockSetExpand).toHaveBeenCalledWith(true)
  })

  it('calls handleOnClose from the close action', async () => {
    const { userEvent } = renderHeader()

    await userEvent.click(screen.getByRole('button', { name: 'xmark' }))

    expect(mockHandleOnClose).toHaveBeenCalled()
  })
})
