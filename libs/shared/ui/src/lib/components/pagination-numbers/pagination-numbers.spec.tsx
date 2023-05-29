import { act, fireEvent, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import Pagination, { PaginationProps } from './pagination-numbers'

const props: PaginationProps = {
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  pageSize: '50',
  onPageSizeChange: jest.fn(),
  nextDisabled: false,
  previousDisabled: false,
}

describe('Pagination', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Pagination {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call onNext on click on next', () => {
    const { baseElement } = render(<Pagination {...props} />)
    const button = getByTestId(baseElement, 'button-next-page')
    button.click()
    expect(props.onNext).toHaveBeenCalled()
  })

  it('should call onPrevious on click on previous', () => {
    const { baseElement } = render(<Pagination {...props} />)
    const button = getByTestId(baseElement, 'button-previous-page')
    button.click()
    expect(props.onPrevious).toHaveBeenCalled()
  })

  it('should have disabled buttons', () => {
    const { baseElement } = render(<Pagination {...props} previousDisabled nextDisabled />)
    const buttonNext = getByTestId(baseElement, 'button-previous-page')
    const buttonPrevious = getByTestId(baseElement, 'button-previous-page')
    expect(buttonNext).toHaveClass('btn--disabled')
    expect(buttonPrevious).toHaveClass('btn--disabled')
  })

  it('should call onPageSizeChange on change on select', async () => {
    const { baseElement } = render(<Pagination {...props} />)
    const select = getByTestId(baseElement, 'select-page-size')

    await act(() => {
      fireEvent.change(select, { target: { value: '10' } })
    })

    expect(props.onPageSizeChange).toHaveBeenCalledWith('10')
  })
})
