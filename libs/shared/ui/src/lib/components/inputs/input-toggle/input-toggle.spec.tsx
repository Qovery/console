import { act, render, screen } from '@qovery/shared/util-tests'
import { InputToggle, type InputToggleProps } from './input-toggle'

describe('InputToggle', () => {
  let props: InputToggleProps

  beforeEach(() => {
    props = {
      small: false,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputToggle />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate class given the size', () => {
    const { rerender } = render(<InputToggle {...props} />)

    let bg = screen.getByLabelText('bg')
    let circle = screen.getByLabelText('circle')

    expect(bg).toHaveClass('w-12 h-6')
    expect(circle).toHaveClass('w-5 h-5')

    props.small = true

    rerender(<InputToggle {...props} />)

    bg = screen.getByLabelText('bg')
    circle = screen.getByLabelText('circle')

    expect(bg).toHaveClass('w-8 h-4.5')
    expect(circle).toHaveClass('w-3.5 h-3.5')
  })

  it('should apply the accurate classes when toggling', () => {
    const { rerender } = render(<InputToggle {...props} />)

    const toggleBtn = screen.getByLabelText('toggle-btn')

    act(() => {
      toggleBtn.click()
    })

    let bg = screen.getByLabelText('bg')
    let circle = screen.getByLabelText('circle')

    expect(bg).toHaveClass('bg-surface-brand-solid')
    expect(circle).toHaveClass('translate-x-6')

    props.small = true

    rerender(<InputToggle {...props} />)

    bg = screen.getByLabelText('bg')
    circle = screen.getByLabelText('circle')

    expect(bg).toHaveClass('bg-surface-brand-solid')
    expect(circle).toHaveClass('translate-x-3.5')
  })

  it('should call onChange when toggled', () => {
    const onChange = jest.fn()
    render(<InputToggle {...props} onChange={onChange} />)

    const toggleBtn = screen.getByLabelText('toggle-btn')

    act(() => {
      toggleBtn.click()
    })

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should respect the value prop when provided', () => {
    const { rerender } = render(<InputToggle {...props} value={true} />)

    let bg = screen.getByLabelText('bg')
    expect(bg).toHaveClass('bg-surface-brand-solid')

    rerender(<InputToggle {...props} value={false} />)

    bg = screen.getByLabelText('bg')
    expect(bg).toHaveClass('bg-surface-neutral-componentActive')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<InputToggle {...props} disabled={true} />)

    const container = screen.getByTestId('input-toggle')
    const toggleBtn = screen.getByLabelText('toggle-btn')

    expect(container).toHaveClass('opacity-50')
    expect(toggleBtn).not.toHaveClass('cursor-pointer')

    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
  })

  it('should not call onChange when disabled', () => {
    const onChange = jest.fn()
    render(<InputToggle {...props} disabled={true} onChange={onChange} />)

    const toggleBtn = screen.getByLabelText('toggle-btn')

    act(() => {
      toggleBtn.click()
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should display title and description when provided', () => {
    render(<InputToggle {...props} title="Test Title" description="Test Description" />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<InputToggle {...props} className="custom-class" />)

    const container = screen.getByTestId('input-toggle')
    expect(container).toHaveClass('custom-class')
  })

  it('should use custom dataTestId when provided', () => {
    render(<InputToggle {...props} dataTestId="custom-toggle" />)

    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument()
  })
})
