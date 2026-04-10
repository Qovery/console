import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { VariablesActionToolbar, type VariablesActionToolbarProps } from './variables-action-toolbar'

const props: VariablesActionToolbarProps = {
  scope: 'APPLICATION',
  projectId: 'project-id',
  environmentId: 'environment-id',
  serviceId: 'service-id',
}

describe('VariablesActionToolbar', () => {
  it('should keep the import button by default when env file import is enabled', () => {
    renderWithProviders(<VariablesActionToolbar {...props} onImportEnvFile={jest.fn()} />)

    expect(screen.getByRole('button', { name: /import variable/i })).toBeInTheDocument()
  })

  it('should render the env file import before doppler in dropdown mode', async () => {
    const { userEvent } = renderWithProviders(
      <VariablesActionToolbar {...props} onImportEnvFile={jest.fn()} importEnvFileAccess="dropdown" />
    )

    await userEvent.click(screen.getAllByRole('button')[0])

    const menuItems = await screen.findAllByRole('menuitem')

    expect(menuItems[0]).toHaveTextContent('Import from .env file')
    expect(menuItems[1]).toHaveTextContent('Import from Doppler')
  })

  it('should call the env file import callback when selected from the dropdown', async () => {
    const onImportEnvFile = jest.fn()
    const { userEvent } = renderWithProviders(
      <VariablesActionToolbar {...props} onImportEnvFile={onImportEnvFile} importEnvFileAccess="dropdown" />
    )

    await userEvent.click(screen.getAllByRole('button')[0])
    await userEvent.click(await screen.findByRole('menuitem', { name: /import from \.env file/i }))

    expect(onImportEnvFile).toHaveBeenCalledTimes(1)
  })
})
