import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputFile, { InputFileProps, readFileAsDataURL } from './input-file'

describe('InputFile', () => {
  const props: InputFileProps = {
    value: 'https://qovery.com/logo',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<InputFile {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a file input field', () => {
    const { baseElement } = render(<InputFile {...props} />)

    expect(baseElement.querySelector('input[type="file"]')).toBeCalled()
  })

  it('should not show preview if no image has been selected', () => {
    props.value = undefined

    const { baseElement } = render(<InputFile {...props} />)

    expect(baseElement.querySelector('img')).not.toBeInTheDocument()
  })

  it('should render preview after image has been selected', async () => {
    props.value = undefined

    const file = new File([new ArrayBuffer(1)], 'file.jpg')

    const { getByTestId, debug } = render(<InputFile {...props} />)

    const fileConvertBase64 = await readFileAsDataURL(file)
    // const image =
    const input = getByTestId('input-file-field')

    // simulate ulpoad event and wait until finish
    await waitFor(async () => {
      fireEvent.change(input, {
        target: { files: [file] },
      })
    })

    // wait for getting resolved
    await Promise.resolve()

    await act(() => {
      debug()
      //   fireEvent.input(input, { target: { files: [file] } })
    })

    // getByTestId('input-file-image')

    // debug()

    // expect(fileConvertBase64).toBe(image?.getAttribute('url'))

    // expect(component.find('img').prop('src')).toBe('image content');
  })
})
