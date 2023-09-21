import { renderWithProviders } from '@qovery/shared/util-tests'
import { EnvironmentMode } from './environment-mode'

describe('EnvironmentMode', () => {
  it('should render as production mode', () => {
    const { baseElement } = renderWithProviders(<EnvironmentMode mode="PRODUCTION" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as staging mode', () => {
    const { baseElement } = renderWithProviders(<EnvironmentMode mode="STAGING" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as preview mode', () => {
    const { baseElement } = renderWithProviders(<EnvironmentMode mode="PREVIEW" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as development mode', () => {
    const { baseElement } = renderWithProviders(<EnvironmentMode mode="DEVELOPMENT" />)
    expect(baseElement).toMatchSnapshot()
  })
})
