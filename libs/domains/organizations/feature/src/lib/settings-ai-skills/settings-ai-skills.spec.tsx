import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsAiSkills } from './settings-ai-skills'

describe('SettingsAiSkills', () => {
  it('renders the install section and available skills', () => {
    renderWithProviders(<SettingsAiSkills />)

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /need help here/i })).toBeInTheDocument()
    expect(screen.getByText('Install the Qovery AI skill')).toBeInTheDocument()
    expect(
      screen.getByText('Run this command once to install Qovery skills for supported AI coding tools.')
    ).toBeInTheDocument()
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(screen.getByText('Available skills')).toBeInTheDocument()
    expect(screen.getByText('qovery-deploy')).toBeInTheDocument()
    expect(screen.getByText('qovery-troubleshoot')).toBeInTheDocument()
    expect(screen.getByText('qovery-builder-portal')).toBeInTheDocument()
  })
})
