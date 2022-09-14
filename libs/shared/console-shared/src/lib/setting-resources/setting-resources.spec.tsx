import { render } from '@testing-library/react'
import SettingResources from './setting-resources'

describe('SettingResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SettingResources />)
    expect(baseElement).toBeTruthy()
  })
})
