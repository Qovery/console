import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputFile, { InputFileProps } from './input-file'

describe('InputFile', () => {
  const props: InputFileProps = {
    value: 'https://qovery.com/logo',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<InputFile {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a file input field', () => {
    const { getByTestId } = render(<InputFile {...props} />)

    getByTestId('input-file-field')
  })

  it('should not show preview if no image has been selected', () => {
    props.value = undefined

    const { baseElement } = render(<InputFile {...props} />)

    expect(baseElement.querySelector('img')).not.toBeInTheDocument()
  })

  it('should render preview after image has been selected', async () => {
    const prop = {
      value: undefined,
    }
    const { getByTestId } = render(<InputFile {...prop} />)
    await act(() => {
      const input = getByTestId('input-file-field')
      const contentType = 'image/png'
      const b64Data =
        'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

      const file = new File([b64Data], 'chucknorris.png', { type: contentType })
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      const img = getByTestId('input-file-image')
      expect(img.getAttribute('src')).toBeTruthy()
    })
  })
})
