import { act, fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import InputFile, { type InputFileProps } from './input-file'

describe('InputFile', () => {
  const props: InputFileProps = {
    value: 'https://qovery.com/logo',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputFile {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a file input field', () => {
    renderWithProviders(<InputFile {...props} />)

    screen.getByTestId('input-file-field')
  })

  it('should not show preview if no image has been selected', () => {
    props.value = undefined

    const { baseElement } = renderWithProviders(<InputFile {...props} />)

    expect(baseElement.querySelector('img')).not.toBeInTheDocument()
  })

  it('should render preview after image has been selected', async () => {
    const prop = {
      value: undefined,
    }
    renderWithProviders(<InputFile {...prop} />)
    await act(() => {
      const input = screen.getByTestId('input-file-field')
      const contentType = 'image/png'
      const b64Data =
        'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

      const file = new File([b64Data], 'chucknorris.png', { type: contentType })
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      const img = screen.getByTestId('input-file-image')
      expect(img.getAttribute('src')).toBeTruthy()
    })
  })
})
