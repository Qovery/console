import { render } from '@testing-library/react'

import Dropzone from './dropzone'

describe('Dropzone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Dropzone />)
    expect(baseElement).toBeTruthy()
  })
})
