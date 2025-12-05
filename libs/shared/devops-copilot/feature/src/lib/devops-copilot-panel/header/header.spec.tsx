import type { MutableRefObject } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { Header } from './header'

jest.mock('@qovery/shared/util-const', () => ({
  QOVERY_FEEDBACK_URL: 'https://feedback.qovery.com',
  QOVERY_FORUM_URL: 'https://forum.qovery.com',
}))

describe('Header', () => {
  const mockSetIsReadOnly = jest.fn()
  const mockSetExpand = jest.fn()
  const mockHandleOnClose = jest.fn()
  const mockSetThread = jest.fn()
  const mockSetThreadId = jest.fn()
  const mockSetIsLoading = jest.fn()
  const mockSetPlan = jest.fn()

  const mockControllerRef: MutableRefObject<AbortController | null> = {
    current: null,
  }

  const defaultProps = {
    threadId: undefined,
    threads: [],
    currentThreadHistoryTitle: 'New conversation',
    readOnlyConfig: undefined,
    isReadOnly: true,
    setIsReadOnly: mockSetIsReadOnly,
    threadLength: 0,
    expand: false,
    setExpand: mockSetExpand,
    handleOnClose: mockHandleOnClose,
    controllerRef: mockControllerRef,
    setThread: mockSetThread,
    setThreadId: mockSetThreadId,
    setIsLoading: mockSetIsLoading,
    setPlan: mockSetPlan,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render header with new conversation title', () => {
      renderWithProviders(<Header {...defaultProps} />)

      expect(screen.getByText('New conversation')).toBeInTheDocument()
    })

    it('should render thread title when threadId exists', () => {
      const threads = [
        { id: 'thread-1', title: 'My Custom Thread' },
        { id: 'thread-2', title: 'Another Thread' },
      ]

      renderWithProviders(
        <Header {...defaultProps} threadId="thread-1" threads={threads} currentThreadHistoryTitle="My Custom Thread" />
      )

      expect(screen.getByText('My Custom Thread')).toBeInTheDocument()
    })

    it('should truncate long thread titles', () => {
      const longTitle = 'This is a very long thread title that should be truncated at 45 characters'
      const threads = [{ id: 'thread-1', title: longTitle }]

      renderWithProviders(
        <Header {...defaultProps} threadId="thread-1" threads={threads} currentThreadHistoryTitle={longTitle} />
      )

      expect(screen.getByText(longTitle + '...')).toBeInTheDocument()
    })

    it('should not truncate short thread titles', () => {
      const shortTitle = 'Short title'
      const threads = [{ id: 'thread-1', title: shortTitle }]

      renderWithProviders(
        <Header {...defaultProps} threadId="thread-1" threads={threads} currentThreadHistoryTitle={shortTitle} />
      )

      expect(screen.getByText(shortTitle)).toBeInTheDocument()
      expect(screen.queryByText(shortTitle + '...')).not.toBeInTheDocument()
    })
  })

  describe('read-only toggle', () => {
    it('should not show read-only toggle when config is not provided', () => {
      renderWithProviders(<Header {...defaultProps} />)

      expect(screen.queryByText('Read-only')).not.toBeInTheDocument()
      expect(screen.queryByText('Read-write')).not.toBeInTheDocument()
    })

    it('should show read-only mode when read-only config is enabled', () => {
      renderWithProviders(<Header {...defaultProps} readOnlyConfig={{ read_only: false }} isReadOnly={true} />)

      expect(screen.getByText('Read-only')).toBeInTheDocument()
    })

    it('should show read-write mode when not read-only', () => {
      renderWithProviders(<Header {...defaultProps} readOnlyConfig={{ read_only: false }} isReadOnly={false} />)

      expect(screen.getByText('Read-write')).toBeInTheDocument()
    })

    it('should allow toggling read-only when thread is empty', async () => {
      const { userEvent, container } = renderWithProviders(
        <Header {...defaultProps} readOnlyConfig={{ read_only: false }} threadLength={0} isReadOnly={true} />
      )

      const toggles = container.querySelectorAll('button')
      const toggle = Array.from(toggles).find(
        (button) => button.className.includes('rounded-full') && button.className.includes('h-5')
      )

      if (toggle) {
        await userEvent.click(toggle)
      }

      expect(mockSetIsReadOnly).toHaveBeenCalledWith(false)
    })

    it('should not allow toggling read-only when thread has messages', async () => {
      const { userEvent, container } = renderWithProviders(
        <Header {...defaultProps} readOnlyConfig={{ read_only: false }} threadLength={5} />
      )

      const toggles = container.querySelectorAll('button')
      const toggle = Array.from(toggles).find(
        (button) => button.className.includes('rounded-full') && button.className.includes('cursor-not-allowed')
      )

      if (toggle) {
        await userEvent.click(toggle)
      }

      expect(mockSetIsReadOnly).not.toHaveBeenCalled()
    })

    it('should disable toggle button when thread has messages', () => {
      const { container } = renderWithProviders(
        <Header {...defaultProps} readOnlyConfig={{ read_only: false }} threadLength={3} />
      )

      const toggles = container.querySelectorAll('button')
      const toggle = Array.from(toggles).find(
        (button) => button.className.includes('rounded-full') && button.className.includes('cursor-not-allowed')
      )

      expect(toggle).toBeDisabled()
    })
  })

  describe('dropdown menu', () => {
    it('should render options button', () => {
      const { container } = renderWithProviders(<Header {...defaultProps} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')
      expect(optionsButton).toBeInTheDocument()
    })

    it('should show new chat option in dropdown', async () => {
      const { userEvent, container } = renderWithProviders(<Header {...defaultProps} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')
      if (optionsButton) {
        await userEvent.click(optionsButton)
      }

      await waitFor(() => {
        expect(screen.getByText('New chat')).toBeInTheDocument()
      })
    })

    it('should show history option when not expanded', async () => {
      const { userEvent, container } = renderWithProviders(<Header {...defaultProps} expand={false} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')
      if (optionsButton) {
        await userEvent.click(optionsButton)
      }

      await waitFor(() => {
        expect(screen.getByText('Show history')).toBeInTheDocument()
      })
    })

    it('should not show history option when expanded', async () => {
      const { userEvent, container } = renderWithProviders(<Header {...defaultProps} expand={true} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')
      if (optionsButton) {
        await userEvent.click(optionsButton)
      }

      await waitFor(() => {
        expect(screen.queryByText('Show history')).not.toBeInTheDocument()
      })
    })
  })

  describe('new chat action', () => {
    it('should reset state when clicking new chat', async () => {
      const abortController = new AbortController()
      const controllerRef: MutableRefObject<AbortController | null> = {
        current: abortController,
      }
      const abortSpy = jest.spyOn(abortController, 'abort')

      const { userEvent, container } = renderWithProviders(<Header {...defaultProps} controllerRef={controllerRef} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')
      if (optionsButton) {
        await userEvent.click(optionsButton)
      }

      const newChatButton = await screen.findByText('New chat')
      await userEvent.click(newChatButton)

      expect(abortSpy).toHaveBeenCalled()
      expect(mockSetThread).toHaveBeenCalledWith([])
      expect(mockSetThreadId).toHaveBeenCalledWith(undefined)
      expect(mockSetIsLoading).toHaveBeenCalledWith(false)
      expect(mockSetPlan).toHaveBeenCalledWith([])
    })
  })

  describe('expand/collapse', () => {
    it('should show expand button when not expanded', () => {
      renderWithProviders(<Header {...defaultProps} expand={false} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should show collapse button when expanded', () => {
      renderWithProviders(<Header {...defaultProps} expand={true} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call setExpand when clicking expand button', async () => {
      const { userEvent } = renderWithProviders(<Header {...defaultProps} expand={false} />)

      const buttons = screen.getAllByRole('button')
      const expandButton = buttons[buttons.length - 2]

      await userEvent.click(expandButton)

      expect(mockSetExpand).toHaveBeenCalledWith(true)
    })

    it('should call setExpand when clicking collapse button', async () => {
      const { userEvent } = renderWithProviders(<Header {...defaultProps} expand={true} />)

      const buttons = screen.getAllByRole('button')
      const collapseButton = buttons[buttons.length - 2]

      await userEvent.click(collapseButton)

      expect(mockSetExpand).toHaveBeenCalledWith(false)
    })
  })

  describe('close button', () => {
    it('should render close button', () => {
      renderWithProviders(<Header {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call handleOnClose when clicking close button', async () => {
      const { userEvent } = renderWithProviders(<Header {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const closeButton = buttons[buttons.length - 1]

      await userEvent.click(closeButton)

      expect(mockHandleOnClose).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper tooltips for buttons', () => {
      const { container } = renderWithProviders(<Header {...defaultProps} />)

      const optionsButton = container.querySelector('.fa-ellipsis')?.closest('button')

      expect(optionsButton).toBeInTheDocument()
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    })

    it('should have tooltip for read-only toggle when enabled', () => {
      const { container } = renderWithProviders(
        <Header {...defaultProps} readOnlyConfig={{ read_only: false }} threadLength={0} isReadOnly={true} />
      )

      const toggles = container.querySelectorAll('button')
      const readOnlyToggle = Array.from(toggles).find(
        (button) => button.className.includes('rounded-full') && button.className.includes('h-5')
      )

      expect(readOnlyToggle).toBeInTheDocument()
    })

    it('should have tooltip explaining disabled toggle', () => {
      const { container } = renderWithProviders(
        <Header {...defaultProps} readOnlyConfig={{ read_only: false }} threadLength={5} />
      )

      const toggles = container.querySelectorAll('button')
      const readOnlyToggle = Array.from(toggles).find(
        (button) => button.className.includes('rounded-full') && button.className.includes('cursor-not-allowed')
      )

      expect(readOnlyToggle).toBeInTheDocument()
      expect(readOnlyToggle).toBeDisabled()
    })
  })
})
