import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LivePlaceholder from './live-placeholder'

jest.mock('../loader-placeholder/loader-placeholder', () => ({
  LoaderPlaceholder: () => <div>Loading...</div>,
}))

describe('LivePlaceholder', () => {
  it('renders LoaderPlaceholder when loadingStatus is not "loaded" and itemsLength is 0', () => {
    renderWithProviders(
      <LivePlaceholder
        serviceName="my-app"
        databaseMode={DatabaseModeEnum.CONTAINER}
        loadingStatus="loading"
        itemsLength={0}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('render default placeholder', () => {
    renderWithProviders(
      <LivePlaceholder
        serviceName="my-app"
        databaseMode={DatabaseModeEnum.CONTAINER}
        loadingStatus="loaded"
        itemsLength={10}
      />
    )

    expect(screen.getByText(/No logs are available for/)).toBeInTheDocument()
    expect(screen.getByText(/my-app/)).toBeInTheDocument()
  })
})
