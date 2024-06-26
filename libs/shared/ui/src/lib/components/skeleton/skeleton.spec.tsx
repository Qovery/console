import { render, screen } from '__tests__/utils/setup-jest'
import Skeleton, { type SkeletonProps } from './skeleton'

describe('Skeleton', () => {
  let props: SkeletonProps

  beforeEach(() => {
    props = {
      children: <p>my-test</p>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Skeleton {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a custom width', () => {
    props.show = true
    props.width = 10

    render(<Skeleton {...props} />)

    const skeleton = screen.queryByTestId('skeleton')

    expect(skeleton).toHaveStyle(`width: 10px`)
  })

  it('should have a custom height', () => {
    props.show = true
    props.height = 10

    render(<Skeleton {...props} />)

    const skeleton = screen.queryByTestId('skeleton')

    expect(skeleton).toHaveStyle(`height: 10px`)
  })

  it('should have a truncate class', () => {
    props.truncate = true

    render(<Skeleton {...props} />)

    const skeleton = screen.queryByTestId('skeleton')

    expect(skeleton?.classList).toContain('truncate')
  })

  it('should have a rounded 100%', () => {
    props.rounded = true
    props.square = true

    render(<Skeleton {...props} />)

    const skeleton = screen.queryByTestId('skeleton')

    expect(skeleton).toHaveStyle(`border-radius: 100%`)
  })
})
