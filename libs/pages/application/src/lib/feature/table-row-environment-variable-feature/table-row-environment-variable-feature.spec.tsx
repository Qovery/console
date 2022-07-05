import { render } from '@testing-library/react'

import TableRowEnvironmentVariableFeature from './table-row-environment-variable-feature'

describe('TableRowEnvironmentVariableFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironmentVariableFeature />)
    expect(baseElement).toBeTruthy()
  })
})
