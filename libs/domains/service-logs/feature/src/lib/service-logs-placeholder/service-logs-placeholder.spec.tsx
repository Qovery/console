import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceLogsPlaceholder } from './service-logs-placeholder'

describe('ServiceLogsPlaceholder', () => {
  it('renders LoaderPlaceholder when loadingStatus is not "loaded" and itemsLength is 0', () => {
    renderWithProviders(
      <ServiceLogsPlaceholder serviceName="my-app" databaseMode={DatabaseModeEnum.CONTAINER} itemsLength={0} />
    )

    expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
  })

  it('render default placeholder', () => {
    renderWithProviders(
      <ServiceLogsPlaceholder serviceName="my-app" databaseMode={DatabaseModeEnum.CONTAINER} itemsLength={10} />
    )

    expect(screen.getByText(/No logs are available for/)).toBeInTheDocument()
    expect(screen.getByText(/my-app/)).toBeInTheDocument()
  })
})
