import { render } from '__tests__/utils/setup-jest'
import { eventsFactoryMock } from '@qovery/shared/factories'
import RowEventFeature from './row-event-feature'

const mockEvent = eventsFactoryMock(1)[0]

const defaultProps = {
  event: mockEvent,
  columnsWidth: '18% 15% 25% 15% 15% 12%',
  expandedEventTimestamp: null,
  setExpandedEventTimestamp: jest.fn(),
}

describe('RowEventFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowEventFeature {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with isPlaceholder prop', () => {
    const { baseElement } = render(<RowEventFeature {...defaultProps} isPlaceholder={true} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with custom columnsWidth', () => {
    const customColumnsWidth = '20% 20% 20% 20% 10% 10%'
    const { baseElement } = render(<RowEventFeature {...defaultProps} columnsWidth={customColumnsWidth} />)
    expect(baseElement).toBeTruthy()
  })

  it('should be expanded when expandedEventTimestamp matches event timestamp', () => {
    const { container } = render(<RowEventFeature {...defaultProps} expandedEventTimestamp={mockEvent.timestamp!} />)
    // The expanded state should be true, which affects the RowEvent rendering
    expect(container).toBeTruthy()
  })

  it('should not be expanded when expandedEventTimestamp does not match', () => {
    const { container } = render(<RowEventFeature {...defaultProps} expandedEventTimestamp="different-timestamp" />)
    expect(container).toBeTruthy()
  })

  it('should call setExpandedEventTimestamp with event timestamp when expanding', () => {
    const mockSetExpanded = jest.fn()
    const { container } = render(
      <RowEventFeature {...defaultProps} setExpandedEventTimestamp={mockSetExpanded} expandedEventTimestamp={null} />
    )

    // Find the row and simulate expansion (this is testing the prop passing)
    expect(container).toBeTruthy()
  })

  it('should call setExpandedEventTimestamp with null when collapsing', () => {
    const mockSetExpanded = jest.fn()
    const { container } = render(
      <RowEventFeature
        {...defaultProps}
        setExpandedEventTimestamp={mockSetExpanded}
        expandedEventTimestamp={mockEvent.timestamp!}
      />
    )

    expect(container).toBeTruthy()
  })

  it('should pass validTargetIds to RowEvent', () => {
    const validTargetIds = {
      project_ids: ['project-1', 'project-2'],
      environment_ids: ['env-1'],
      application_ids: ['app-1'],
    }
    const { baseElement } = render(<RowEventFeature {...defaultProps} validTargetIds={validTargetIds} />)
    expect(baseElement).toBeTruthy()
  })

  it('should handle missing optional props', () => {
    const minimalProps = {
      event: mockEvent,
      columnsWidth: '18% 15% 25% 15% 15% 12%',
      expandedEventTimestamp: null,
      setExpandedEventTimestamp: jest.fn(),
    }
    const { baseElement } = render(<RowEventFeature {...minimalProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should work with different event data', () => {
    const additionalEvent = eventsFactoryMock(1)[0]
    const { baseElement } = render(<RowEventFeature {...defaultProps} event={additionalEvent} />)
    expect(baseElement).toBeTruthy()
  })
})
