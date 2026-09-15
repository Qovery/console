import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { QoveryServiceContextModal } from './qovery-service-context-modal'

const services = [
  { id: 'application-1', name: 'api', type: 'APPLICATION' },
  { id: 'database-1', name: 'postgres', type: 'DATABASE' },
]

describe('QoveryServiceContextModal', () => {
  it('selects multiple services from the environment', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal isLoading={false} services={services} value={[]} onSave={onSave} setOpen={jest.fn()} />
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'postgres' }))
    expect(screen.getByRole('button', { name: 'Reset all' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }))

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
  })

  it('hides the reset action when no service is selected', () => {
    renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={[]}
        onSave={jest.fn()}
        setOpen={jest.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: 'Reset all' })).not.toBeInTheDocument()
  })

  it('resets all selected services', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(
      <QoveryServiceContextModal
        isLoading={false}
        services={services}
        value={services}
        onSave={onSave}
        setOpen={jest.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reset all' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }))

    expect(onSave).toHaveBeenCalledWith([])
  })
})
