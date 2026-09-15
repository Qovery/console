import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { QoveryServiceContextModal } from './qovery-service-context-modal'

const services = [
  { id: 'application-1', name: 'api', type: 'APPLICATION' },
  { id: 'database-1', name: 'postgres', type: 'DATABASE' },
]

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, reject, resolve }
}

describe('QoveryServiceContextModal', () => {
  it('selects multiple services from the environment', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal isLoading={false} services={services} value={[]} onSave={onSave} setOpen={jest.fn()} />
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'postgres' }))
    expect(screen.queryByRole('button', { name: 'Select all' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onSave).toHaveBeenCalledWith(services)
  })

  it('keeps existing services selected when editing', () => {
    renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[services[0]]}
        onSave={jest.fn()}
        setOpen={jest.fn()}
      />
    )

    expect(screen.getByRole('checkbox', { name: 'api' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument()
  })

  it('keeps Select all available when only a stale service ID is selected', () => {
    renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[{ id: 'removed-service', name: 'removed', type: 'APPLICATION' }]}
        onSave={jest.fn()}
        setOpen={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument()
  })

  it('removes the hidden Select all action from keyboard interaction', () => {
    renderWithProviders(
      <QoveryServiceContextModal isLoading={false} services={services} value={services} onSave={jest.fn()} />
    )

    expect(screen.getByText('Select all').closest('button')).toBeDisabled()
  })

  it('prevents closing while services are being saved', async () => {
    const save = deferred<void>()
    const setOpen = jest.fn()
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[services[0]]}
        onSave={() => save.promise}
        setOpen={setOpen}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Select all' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'api' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'postgres' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(setOpen).not.toHaveBeenCalled()

    save.resolve()
    expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('prevents submitting again while services are being saved', async () => {
    const save = deferred<void>()
    const onSave = jest.fn(() => save.promise)
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[services[0]]}
        onSave={onSave}
        setOpen={jest.fn()}
      />
    )

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    confirmButton.focus()
    await userEvent.keyboard(' ')

    expect(confirmButton).toBeDisabled()
    await userEvent.keyboard(' ')
    expect(onSave).toHaveBeenCalledTimes(1)

    save.resolve()
    await waitFor(() => expect(confirmButton).toBeEnabled())
  })

  it('shows an error and stays open when saving fails', async () => {
    const save = deferred<void>()
    const setOpen = jest.fn()
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[services[0]]}
        onSave={() => save.promise}
        setOpen={setOpen}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    save.reject(new Error('MCP creation failed'))

    expect(await screen.findByText('Unable to add the selected services. Try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled()
    expect(setOpen).not.toHaveBeenCalled()
  })
})
