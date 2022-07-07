import { render } from '@testing-library/react'

import CrudEnvironmentVariableModalFeature from './crud-environment-variable-modal-feature'

describe('CrudEnvironmentVariableModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CrudEnvironmentVariableModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
