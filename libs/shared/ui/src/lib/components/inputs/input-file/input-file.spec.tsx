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

  it('should render preview after image has been selected', async () => {})
})
