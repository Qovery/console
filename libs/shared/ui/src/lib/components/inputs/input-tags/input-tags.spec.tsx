import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputTags, { InputTagsProps } from './input-tags'

describe('InputTags', () => {
  const props: InputTagsProps = {
    label: 'Tags',
    tags: ['hello', 'world'],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<InputTags {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should add a tag', async () => {
    const { getByTestId } = render(<InputTags {...props} />)

    const input = getByTestId('input-tags-field')

    await act(() => {
      fireEvent.input(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    })

    expect(getByTestId('input-tags-2').textContent).toBe('test')
  })

  it('should remove a tag', async () => {
    const { getByTestId } = render(<InputTags {...props} />)

    await act(() => {
      fireEvent.click(getByTestId('input-tags-remove-0'))
    })

    expect(getByTestId('input-tags-0').textContent).toBe('world')
  })

  it('should remove the last tag', async () => {
    const { getByTestId, queryByTestId } = render(<InputTags {...props} />)

    const input = getByTestId('input-tags-field')

    await act(() => {
      fireEvent.input(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Backspace' })
    })

    expect(getByTestId('input-tags-0').textContent).toBe('hello')
    expect(queryByTestId(/input-tags-1/i)).toBeNull()
  })
})
