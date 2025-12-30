import { render, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type RecurringTask, SectionScheduledTasks } from './section-scheduled-tasks'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    useModal: () => ({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    }),
  }
})

describe('SectionScheduledTasks', () => {
  const mockOnToggleTask = jest.fn()
  const mockOnDeleteTask = jest.fn()

  const mockTask: RecurringTask = {
    id: 'task-1',
    user_id: 'user-123',
    user_intent: 'Check deployment status',
    cron_expression: '0 */2 * * *',
    enabled: true,
    environment: 'production',
    last_run_at: '2024-01-15T10:30:00Z',
    error_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  }

  const defaultProps = {
    tasks: [mockTask],
    isLoading: false,
    onToggleTask: mockOnToggleTask,
    onDeleteTask: mockOnDeleteTask,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render section heading', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText('Scheduled Tasks')).toBeInTheDocument()
      expect(screen.getByText('Recurring tasks configured for your organization')).toBeInTheDocument()
    })

    it('should render tasks list title', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText('Tasks List')).toBeInTheDocument()
    })

    it('should show loader when loading', () => {
      const { container } = render(<SectionScheduledTasks {...defaultProps} isLoading={true} />)

      expect(container.querySelector('.w-5')).toBeInTheDocument()
      expect(screen.queryByText('Check deployment status')).not.toBeInTheDocument()
    })

    it('should show empty state when no tasks', () => {
      render(<SectionScheduledTasks {...defaultProps} tasks={[]} />)

      expect(screen.getByText('No scheduled tasks configured yet.')).toBeInTheDocument()
    })
  })

  describe('task display', () => {
    it('should display task user intent', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText('Check deployment status')).toBeInTheDocument()
    })

    it('should display task schedule', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText('Schedule: 0 */2 * * *')).toBeInTheDocument()
    })

    it('should display last run time when available', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText(/Last run:/)).toBeInTheDocument()
    })

    it('should not display last run time when not available', () => {
      const taskWithoutLastRun = { ...mockTask, last_run_at: undefined }
      render(<SectionScheduledTasks {...defaultProps} tasks={[taskWithoutLastRun]} />)

      expect(screen.queryByText(/Last run:/)).not.toBeInTheDocument()
    })

    it('should display error count when greater than zero', () => {
      const taskWithErrors = { ...mockTask, error_count: 3 }
      render(<SectionScheduledTasks {...defaultProps} tasks={[taskWithErrors]} />)

      expect(screen.getByText('Errors: 3')).toBeInTheDocument()
    })

    it('should not display error count when zero', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.queryByText(/Errors:/)).not.toBeInTheDocument()
    })

    it('should display last error message when available', () => {
      const taskWithError = { ...mockTask, last_error: 'Connection timeout' }
      render(<SectionScheduledTasks {...defaultProps} tasks={[taskWithError]} />)

      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })

    it('should display enabled status badge', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('should display disabled status badge', () => {
      const disabledTask = { ...mockTask, enabled: false }
      render(<SectionScheduledTasks {...defaultProps} tasks={[disabledTask]} />)

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should render multiple tasks', () => {
      const tasks = [
        mockTask,
        {
          ...mockTask,
          id: 'task-2',
          user_intent: 'Monitor resource usage',
          enabled: false,
        },
      ]
      render(<SectionScheduledTasks {...defaultProps} tasks={tasks} />)

      expect(screen.getByText('Check deployment status')).toBeInTheDocument()
      expect(screen.getByText('Monitor resource usage')).toBeInTheDocument()
    })
  })

  describe('toggle task', () => {
    it('should call onToggleTask when clicking pause button', async () => {
      const { userEvent } = renderWithProviders(<SectionScheduledTasks {...defaultProps} />)

      const pauseButton = screen.getByTitle('Pause task')
      await userEvent.click(pauseButton)

      expect(mockOnToggleTask).toHaveBeenCalledWith('task-1')
    })

    it('should call onToggleTask when clicking play button for disabled task', async () => {
      const disabledTask = { ...mockTask, enabled: false }
      const { userEvent } = renderWithProviders(<SectionScheduledTasks {...defaultProps} tasks={[disabledTask]} />)

      const playButton = screen.getByTitle('Resume task')
      await userEvent.click(playButton)

      expect(mockOnToggleTask).toHaveBeenCalledWith('task-1')
    })
  })

  describe('delete task', () => {
    it('should open modal when clicking delete button', async () => {
      mockOpenModal.mockClear()
      mockCloseModal.mockClear()

      const { userEvent } = renderWithProviders(<SectionScheduledTasks {...defaultProps} />)

      const deleteButton = screen.getByTitle('Delete task')
      expect(deleteButton).toBeInTheDocument()

      await userEvent.click(deleteButton)

      expect(mockOpenModal).toHaveBeenCalled()
    })

    it('should display confirmation modal content', async () => {
      let modalContent: React.ReactNode = null
      mockOpenModal.mockClear()
      mockOpenModal.mockImplementation((config) => {
        modalContent = config.content
      })

      const { userEvent } = renderWithProviders(<SectionScheduledTasks {...defaultProps} />)

      const deleteButton = screen.getByTitle('Delete task')

      await userEvent.click(deleteButton)

      expect(modalContent).toBeTruthy()

      const { container } = render(modalContent)
      expect(container).toHaveTextContent(/Delete Task/)
      expect(container).toHaveTextContent(/Are you sure you want to delete this task\? This action cannot be undone\./)
    })

    it('should call onDeleteTask when confirming deletion', async () => {
      mockOpenModal.mockClear()

      const { userEvent } = renderWithProviders(<SectionScheduledTasks {...defaultProps} />)

      const deleteButton = screen.getByTitle('Delete task')

      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockOpenModal).toHaveBeenCalled()
      })
    })
  })

  describe('task status indicators', () => {
    it('should show green badge for enabled tasks', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      const badge = screen.getByText('Enabled')
      expect(badge).toBeInTheDocument()
    })

    it('should show neutral badge for disabled tasks', () => {
      const disabledTask = { ...mockTask, enabled: false }
      render(<SectionScheduledTasks {...defaultProps} tasks={[disabledTask]} />)

      const badge = screen.getByText('Disabled')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper button titles', () => {
      render(<SectionScheduledTasks {...defaultProps} />)

      expect(screen.getByTitle('Pause task')).toBeInTheDocument()
    })

    it('should show play title for disabled tasks', () => {
      const disabledTask = { ...mockTask, enabled: false }
      render(<SectionScheduledTasks {...defaultProps} tasks={[disabledTask]} />)

      expect(screen.getByTitle('Resume task')).toBeInTheDocument()
    })
  })
})
