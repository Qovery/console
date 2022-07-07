import { render } from '@testing-library/react'

import CrudEnvironmentVariableModal from './crud-environment-variable-modal'

describe('CrudEnvironmentVariableModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CrudEnvironmentVariableModal />)
    expect(baseElement).toBeTruthy()
  })
})
