import { render } from '@testing-library/react'

import GeneralPage from './general'

describe('GeneralPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GeneralPage />)
    expect(baseElement).toBeTruthy()
  })
})
