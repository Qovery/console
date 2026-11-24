import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { configure } from '@testing-library/react'
import axios from 'axios'
import { SkillPresetsApi } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { devopsCopilotAxios } from '@qovery/shared/devops-copilot/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { MemberAgentView } from './member-agent-view/member-agent-view'
import { SettingsSkillPresets } from './settings-skill-presets/settings-skill-presets'
import { SkillPresetCreate } from './template-gallery/template-gallery'
import {
  buildSkillPresetApiError,
  installSkillPresetsFixtures,
  setSkillPresetsScenario,
} from './test-fixtures/skill-presets'

jest.mock('@qovery/shared/iam/feature', () => ({
  ...jest.requireActual('@qovery/shared/iam/feature'),
  useUserRole: () => ({
    roles: jest.requireActual('./test-fixtures/skill-presets').isSkillPresetsTestMember()
      ? []
      : ['organization:organization-1:admin'],
    loading: false,
    isQoveryAdminUser: false,
  }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useSearch: jest.fn(),
  useBlocker: jest.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

jest.mock('@monaco-editor/react', () => {
  const { forwardRef } = jest.requireActual('react')
  const FakeEditor = forwardRef(
    (props: { value: string; onChange: (value: string) => void; options?: { ariaLabel?: string } }, ref: never) => (
      <textarea
        ref={ref}
        aria-label={props.options?.ariaLabel}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    )
  )
  return { Editor: FakeEditor, DiffEditor: FakeEditor }
})

configure({ asyncUtilTimeout: 5000 })

const mockNavigate = jest.fn()

let uninstallMocks: Array<() => void> = []
beforeAll(() => {
  uninstallMocks = [
    installSkillPresetsFixtures(axios, 'api'),
    installSkillPresetsFixtures(devopsCopilotAxios, 'copilot'),
  ]
})
afterAll(() => uninstallMocks.forEach((uninstall) => uninstall()))
afterEach(() => jest.restoreAllMocks())

beforeEach(() => {
  window.sessionStorage.clear()
  setSkillPresetsScenario()
  mockNavigate.mockReset()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  jest.mocked(useSearch).mockReturnValue({})
})

describe('presets list', () => {
  it('fails once and loads on retry', async () => {
    setSkillPresetsScenario('errors')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('The Skills registry could not be loaded')).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'The server encountered an error. Your members’ agents keep working with the preset they last loaded.'
      )
    ).toBeInTheDocument()
    expect(within(alert).getByText('Details: HTTP 500, Internal server error')).toBeInTheDocument()

    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Backend team')).toBeInTheDocument()
  })

  it('deletes a preset after typing its name', async () => {
    setSkillPresetsScenario('typical')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const row = await screen.findByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02')

    await userEvent.click(within(row).getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.type(screen.getByRole('textbox'), 'Platform (CLI-first)')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(row).not.toBeInTheDocument())
    expect(screen.getByText('Backend team')).toBeInTheDocument()
  })

  it('hides the create action and shows the member view to non-admins', async () => {
    setSkillPresetsScenario('member')
    renderWithProviders(<SettingsSkillPresets />)

    expect(
      await screen.findByText(/Only organization owners and admins can change the Skills registry/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create preset/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Assignments' })).not.toBeInTheDocument()
  })
})

describe('Connect an agent', () => {
  it('opens the popup from the registry header', async () => {
    setSkillPresetsScenario('typical')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    await userEvent.click(await screen.findByRole('button', { name: /Connect an agent/ }))
    expect(await screen.findByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
  })

  it('opens it by itself from an old Connect link, then drops the parameter', async () => {
    setSkillPresetsScenario('typical')
    jest.mocked(useSearch).mockReturnValue({ connect: true })
    renderWithProviders(<SettingsSkillPresets />)
    expect(await screen.findByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ search: {}, replace: true }))
  })
})

describe('member view', () => {
  it('lists what the member’s agent receives, with sizes and hashes', async () => {
    setSkillPresetsScenario('member')
    renderWithProviders(<MemberAgentView organizationId="organization-1" />)

    expect(await screen.findByText('Backend team')).toBeInTheDocument()
    expect(screen.getByText('The organization default')).toBeInTheDocument()
    const [pieces] = screen.getAllByRole('table')
    expect(within(pieces).getByText('qovery-deploy')).toBeInTheDocument()
    expect(within(pieces).getByText('Team context')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What it costs your agent in context' })).toBeInTheDocument()
  })

  it('reads the full text of a skill on demand', async () => {
    setSkillPresetsScenario('member')
    const { userEvent } = renderWithProviders(<MemberAgentView organizationId="organization-1" />)
    await screen.findByText('Backend team')
    const [pieces] = screen.getAllByRole('table')
    const row = within(pieces).getByText('qovery-deploy').closest('tr') as HTMLElement

    await userEvent.click(within(row).getByRole('button', { name: /Read/ }))

    expect(await screen.findByText(/Deploy to the `staging` environment first/)).toBeInTheDocument()
    expect(screen.getByText(/^SHA-256 [0-9a-f]{64}$/)).toBeInTheDocument()
  })

  it('says when a skill left the preset since the list loaded, with no retry', async () => {
    setSkillPresetsScenario('member')
    jest
      .spyOn(SkillPresetsApi.prototype, 'getResolvedSkill')
      .mockRejectedValue(buildSkillPresetApiError(404, "There is no skill 'qovery-deploy' to load"))
    const { userEvent } = renderWithProviders(<MemberAgentView organizationId="organization-1" />)
    await screen.findByText('Backend team')
    const [pieces] = screen.getAllByRole('table')
    const row = within(pieces).getByText('qovery-deploy').closest('tr') as HTMLElement

    await userEvent.click(within(row).getByRole('button', { name: /Read/ }))

    expect(await screen.findByTestId('skill-gone')).toHaveTextContent('qovery-deploy is no longer in your preset.')
    expect(screen.queryByRole('button', { name: /Try again/ })).not.toBeInTheDocument()
  })

  it('says when no preset applies', async () => {
    setSkillPresetsScenario('member-no-preset')
    renderWithProviders(<MemberAgentView organizationId="organization-1" />)

    expect(await screen.findByTestId('member-no-preset')).toHaveTextContent(
      'No preset applies. Your agent uses the Qovery skills as published.'
    )
  })
})

describe('create flow', () => {
  it('opens the editor from a template', async () => {
    setSkillPresetsScenario('empty')
    const { userEvent } = renderWithProviders(<SkillPresetCreate />)

    await userEvent.click(screen.getByRole('button', { name: /Developer/ }))

    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ search: { template: 'developer' } }))
  })

  it('prefills the editor with the chosen template', async () => {
    setSkillPresetsScenario('empty')
    jest.mocked(useSearch).mockReturnValue({ template: 'developer' })
    renderWithProviders(<SkillPresetCreate />)

    expect(await screen.findByDisplayValue('Developers')).toBeInTheDocument()
    expect(screen.getByText(/Started from the Developer template/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Team instructions for qovery-deploy' })).toBeInTheDocument()
  })
})

describe('AI features off', () => {
  it('explains why and disables creating, while the list stays readable', async () => {
    setSkillPresetsScenario('ai-features-off')
    renderWithProviders(<SettingsSkillPresets />)

    expect(await screen.findByTestId('ai-features-notice')).toHaveTextContent('The Skills registry needs AI features')
    expect(screen.getByRole('button', { name: /Create preset/ })).toBeDisabled()
    expect(await screen.findByText('Backend team')).toBeInTheDocument()
  })

  it('turns AI on, then enables creating', async () => {
    setSkillPresetsScenario('ai-features-off')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    await screen.findByTestId('ai-features-notice')

    await userEvent.click(screen.getByRole('button', { name: 'Turn on AI' }))
    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    )
    // Submitting waits for the Copilot status, so an enabled Copilot is never reset to read-only.
    await waitFor(() => expect(screen.getByTestId('submit-button')).toBeEnabled())
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => expect(screen.queryByTestId('ai-features-notice')).not.toBeInTheDocument())
    // The dialog closes on its own after success: wait for the page to be reachable again.
    expect(await screen.findByRole('button', { name: /Create preset/ })).toBeEnabled()
  })

  it('still lets an admin delete a preset', async () => {
    setSkillPresetsScenario('ai-features-off')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const row = await screen.findByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02')

    await userEvent.click(within(row).getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.type(screen.getByRole('textbox'), 'Platform (CLI-first)')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(row).not.toBeInTheDocument())
    expect(screen.getByText('Backend team')).toBeInTheDocument()
  })
})
