import { render } from '@testing-library/react'
import JobGeneralSetting from './job-general-setting'

describe('JobGeneralSetting', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JobGeneralSetting />)
    expect(baseElement).toBeTruthy()
  })
})
