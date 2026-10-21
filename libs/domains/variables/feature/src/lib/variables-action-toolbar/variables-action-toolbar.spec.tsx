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

  it('should render the doppler dashboard and documentation as separate links', async () => {
    const { userEvent } = renderWithProviders(<VariablesActionToolbar {...props} />)

    await userEvent.click(screen.getAllByRole('button')[0])

    const dashboardLink = await screen.findByRole('menuitem', { name: 'Import from Doppler' })
    const documentationLink = screen.getByRole('menuitem', { name: 'Doppler integration documentation' })

    // Real anchors, so middle-click, modifier-click and "Open in new tab" work
    expect(dashboardLink.tagName).toBe('A')
    expect(dashboardLink).toHaveAttribute('href', 'https://dashboard.doppler.com')
    expect(documentationLink.tagName).toBe('A')
    expect(documentationLink).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/integrations/secret-managers/doppler#doppler'
    )
    // A link nested in another link is invalid HTML
    expect(dashboardLink).not.toContainElement(documentationLink)
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
