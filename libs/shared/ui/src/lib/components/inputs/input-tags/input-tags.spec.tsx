import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import InputTags, { type InputTagsProps } from './input-tags'

describe('InputTags', () => {
  const props: InputTagsProps = {
    label: 'Tags',
    tags: ['hello', 'world'],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputTags {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should add a tag', async () => {
    renderWithProviders(<InputTags {...props} />)

    const input = screen.getByTestId('input-tags-field')

    fireEvent.input(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })

    expect(screen.getByTestId('input-tags-2')).toHaveTextContent('test')
  })

  it('should remove a tag', async () => {
    renderWithProviders(<InputTags {...props} />)

    fireEvent.click(screen.getByTestId('input-tags-remove-0'))

    expect(screen.getByTestId('input-tags-0')).toHaveTextContent('world')
  })

  it('should remove the last tag', async () => {
    renderWithProviders(<InputTags {...props} />)

    const input = screen.getByTestId('input-tags-field')

    fireEvent.input(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(screen.getByTestId('input-tags-0')).toHaveTextContent('hello')
    expect(screen.queryByTestId(/input-tags-1/i)).not.toBeInTheDocument()
  })
})
