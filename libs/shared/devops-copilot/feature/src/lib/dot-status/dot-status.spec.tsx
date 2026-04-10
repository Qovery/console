import { render } from '@qovery/shared/util-tests'
import { DotStatus } from './dot-status'

describe('DotStatus', () => {
  it('should render red dot with correct styles', () => {
    const { container } = render(<DotStatus color="red" />)
    const dot = container.querySelector('div')

    expect(dot).toHaveClass('bg-surface-negative-solid')
    expect(dot).toHaveClass('border-negative-subtle')
  })

  it('should render yellow dot with correct styles', () => {
    const { container } = render(<DotStatus color="yellow" />)
    const dot = container.querySelector('div')

    expect(dot).toHaveClass('bg-surface-warning-solid')
    expect(dot).toHaveClass('border-warning-subtle')
  })

  it('should render green dot with correct styles', () => {
    const { container } = render(<DotStatus color="green" />)
    const dot = container.querySelector('div')

    expect(dot).toHaveClass('bg-surface-positive-solid')
    expect(dot).toHaveClass('border-positive-subtle')
  })

  it('should match snapshot for red', () => {
    const { baseElement } = render(<DotStatus color="red" />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot for yellow', () => {
    const { baseElement } = render(<DotStatus color="yellow" />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot for green', () => {
    const { baseElement } = render(<DotStatus color="green" />)
    expect(baseElement).toMatchSnapshot()
  })
})
