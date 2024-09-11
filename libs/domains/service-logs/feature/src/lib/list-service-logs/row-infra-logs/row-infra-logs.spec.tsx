import { renderWithProviders } from '@qovery/shared/util-tests'
import RowInfraLogs from './row-infra-logs'

describe('RowInfraLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowInfraLogs />)
    expect(baseElement).toBeTruthy()
  })
})
