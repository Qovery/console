import { render } from '__tests__/utils/setup-jest'
import Dropzone from './dropzone'

describe('Dropzone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Dropzone />)
    expect(baseElement).toBeTruthy()
  })
})
