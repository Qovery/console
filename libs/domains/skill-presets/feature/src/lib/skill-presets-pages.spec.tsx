import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import {
  type SkillPresetsMockScenario,
  buildSkillPresetApiError,
  resetSkillPresetsMockApi,
  skillPresetsApi,
} from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, waitForElementToBeRemoved, within } from '@qovery/shared/util-tests'
import { MemberAgentView } from './member-agent-view/member-agent-view'
import { MockScenarioBanner } from './mock-scenario-banner/mock-scenario-banner'
import { SettingsSkillPresets } from './settings-skill-presets/settings-skill-presets'
import { SkillLoads } from './skill-loads/skill-loads'
import { SkillPresetAssignments } from './skill-preset-assignments/skill-preset-assignments'
import { SkillPresetUsage } from './skill-preset-usage/skill-preset-usage'
import { SkillPresetCreate } from './template-gallery/template-gallery'

/*
 * These tests go through the real hooks and the in-browser mock API (the same one preview builds use),
 * so they check the pages against the documented response shapes, not hand-written fixtures.
 */

// Read through a global: the mock mode module reads the flag while imports are still loading.
const flagHolder = globalThis as { skillPresetsMockFlag?: string }
const setMockFlag = (value?: string) => {
  flagHolder.skillPresetsMockFlag = value
}
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  get SKILL_PRESETS_MOCK() {
    return (globalThis as { skillPresetsMockFlag?: string }).skillPresetsMockFlag
  },
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

const mockNavigate = jest.fn()

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMockApi()
}

beforeEach(() => {
  setMockFlag('true')
  window.sessionStorage.clear()
  resetSkillPresetsMockApi()
  mockNavigate.mockReset()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  jest.mocked(useSearch).mockReturnValue({})
})

describe('mock scenario banner', () => {
  it('shows the mock data badge and scenario when the mock is active', async () => {
    useScenario('large')
    renderWithProviders(<MockScenarioBanner />)

    const banner = await screen.findByTestId('mock-scenario-banner')
    expect(within(banner).getByText('Mock data')).toBeInTheDocument()
    expect(within(banner).getByText(/40 presets/)).toBeInTheDocument()
  })

  it('renders nothing when the build flag is off', async () => {
    setMockFlag(undefined)
    useScenario('typical')
    const { container } = renderWithProviders(<MockScenarioBanner />)

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })
})

describe('presets list', () => {
  it('fails once in the errors scenario, says it is simulated, and loads on retry', async () => {
    useScenario('errors')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('The Skills Registry could not be loaded')).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'Qovery could not reach the server. Your members’ agents keep working with the preset they last loaded.'
      )
    ).toBeInTheDocument()
    expect(within(alert).getByText('Details: HTTP 500, Internal server error')).toBeInTheDocument()
    expect(within(alert).getByText('Simulated by the errors mock scenario.')).toBeInTheDocument()

    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Backend team')).toBeInTheDocument()
  })

  it('shows the scenario and a reset in the mock bar for any scenario but typical', async () => {
    useScenario('errors')
    renderWithProviders(<MockScenarioBanner />)
    expect(await screen.findByTestId('mock-scenario-name')).toHaveTextContent('Scenario: errors')
    expect(screen.getByRole('button', { name: 'Reset to typical' })).toBeInTheDocument()
  })

  it('deletes a preset after typing its name', async () => {
    useScenario('typical')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const row = await screen.findByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02')

    await userEvent.click(within(row).getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.type(screen.getByRole('textbox'), 'Platform (CLI-first)')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitForElementToBeRemoved(() => screen.queryByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02'))
    expect(screen.getByText('Backend team')).toBeInTheDocument()
  })

  it('hides the create action and shows the member view to non-admins', async () => {
    useScenario('member')
    renderWithProviders(<SettingsSkillPresets />)

    expect(
      await screen.findByText(/Only organization owners and admins can change the Skills Registry/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create preset/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Assignments' })).not.toBeInTheDocument()
  })
})

describe('member view', () => {
  it('lists what the member’s agent receives, with sizes and hashes', async () => {
    useScenario('member')
    renderWithProviders(<MemberAgentView organizationId="organization-1" />)

    expect(await screen.findByText('Backend team')).toBeInTheDocument()
    expect(screen.getByText('The organization default')).toBeInTheDocument()
    const [pieces] = screen.getAllByRole('table')
    expect(within(pieces).getByText('qovery-deploy')).toBeInTheDocument()
    expect(within(pieces).getByText('Team context')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What it costs your agent in context' })).toBeInTheDocument()
  })

  it('reads the full text of a skill on demand', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<MemberAgentView organizationId="organization-1" />)
    await screen.findByText('Backend team')
    const [pieces] = screen.getAllByRole('table')
    const row = within(pieces).getByText('qovery-deploy').closest('tr') as HTMLElement

    await userEvent.click(within(row).getByRole('button', { name: /Read/ }))

    expect(await screen.findByText(/Deploy to the `staging` environment first/)).toBeInTheDocument()
    expect(screen.getByText(/^SHA-256 [0-9a-f]{64}$/)).toBeInTheDocument()
  })

  it('says when no preset applies', async () => {
    useScenario('member-no-preset')
    renderWithProviders(<MemberAgentView organizationId="organization-1" />)

    expect(await screen.findByTestId('member-no-preset')).toHaveTextContent(
      'No preset applies. Your agent uses the Qovery skills as published.'
    )
  })
})

describe('assignments', () => {
  it('shows the effective preset of every member and why', async () => {
    useScenario('typical')
    renderWithProviders(<SkillPresetAssignments />)

    const jamie = (await screen.findByText('Jamie Rossi')).closest('tr')
    expect(jamie).not.toBeNull()
    expect(within(jamie as HTMLElement).getByText('External contractors')).toBeInTheDocument()
    expect(within(jamie as HTMLElement).getByText('Assigned to the member')).toBeInTheDocument()
    const priya = screen.getByText('Priya Shah').closest('tr') as HTMLElement
    expect(within(priya).getByText('Platform (CLI-first)')).toBeInTheDocument()
    expect(within(priya).getByText('From their role')).toBeInTheDocument()
  })
})

describe('skill loads', () => {
  it('lists loads with their preset and delivery, and pages through them', async () => {
    useScenario('large')
    const { userEvent } = renderWithProviders(<SkillLoads />)

    const table = await screen.findByRole('table', undefined, { timeout: 5000 })
    expect(within(table).getAllByRole('row')).toHaveLength(31)
    expect(within(table).getAllByText(/From cache|Fetched/).length).toBe(30)

    await userEvent.click(screen.getByTestId('button-next-page'))
    await waitFor(() => expect(screen.getByTestId('button-previous-page')).toBeEnabled())
  })
})

describe('usage', () => {
  it('shows totals and drills into a member', async () => {
    useScenario('typical')
    const { userEvent } = renderWithProviders(<SkillPresetUsage />)

    const heading = await screen.findByRole('heading', { name: 'Top members' })
    expect(screen.getByText('Served from cache')).toBeInTheDocument()
    const topMembers = heading.parentElement as HTMLElement
    const [firstMember] = within(topMembers).getAllByRole('button')
    await userEvent.click(firstMember)

    expect(firstMember).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })

  it('drills into a skill, toggles it off again, and clears every filter at once', async () => {
    useScenario('typical')
    const { userEvent } = renderWithProviders(<SkillPresetUsage />)

    const heading = await screen.findByRole('heading', { name: 'Top skills' })
    const topSkills = heading.parentElement as HTMLElement
    const [firstSkill] = within(topSkills).getAllByRole('button')
    await userEvent.click(firstSkill)
    expect(firstSkill).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(firstSkill)
    expect(firstSkill).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(firstSkill)
    await userEvent.click(await screen.findByRole('button', { name: 'Clear filters' }))
    expect(firstSkill).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
  })

  it('shows a load error with a retry', async () => {
    useScenario('typical')
    const getUsage = jest
      .spyOn(skillPresetsApi, 'getSkillPresetUsage')
      .mockRejectedValue(buildSkillPresetApiError(503, 'Unavailable'))
    const { userEvent } = renderWithProviders(<SkillPresetUsage />)

    expect(await screen.findByText('Usage could not be loaded')).toBeInTheDocument()
    const calls = getUsage.mock.calls.length
    await userEvent.click(screen.getByRole('button', { name: /Try again/ }))
    await waitFor(() => expect(getUsage.mock.calls.length).toBeGreaterThan(calls))
    getUsage.mockRestore()
  })
})

describe('create flow', () => {
  it('opens the editor from a template', async () => {
    useScenario('empty')
    const { userEvent } = renderWithProviders(<SkillPresetCreate />)

    await userEvent.click(screen.getByRole('button', { name: /Developer/ }))

    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ search: { template: 'developer' } }))
  })

  it('prefills the editor with the chosen template', async () => {
    useScenario('empty')
    jest.mocked(useSearch).mockReturnValue({ template: 'developer' })
    renderWithProviders(<SkillPresetCreate />)

    expect(await screen.findByDisplayValue('Developers')).toBeInTheDocument()
    expect(screen.getByText(/Started from the Developer template/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Team instructions for qovery-deploy' })).toBeInTheDocument()
  })
})

describe('AI features off', () => {
  it('explains why and disables creating, while the list stays readable', async () => {
    useScenario('ai-features-off')
    renderWithProviders(<SettingsSkillPresets />)

    expect(await screen.findByTestId('ai-features-notice')).toHaveTextContent('The Skills Registry needs AI features')
    expect(screen.getByRole('button', { name: /Create preset/ })).toBeDisabled()
    expect(await screen.findByText('Backend team')).toBeInTheDocument()
  })

  it('turns AI on, then enables creating', async () => {
    useScenario('ai-features-off')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    await screen.findByTestId('ai-features-notice')

    await userEvent.click(screen.getByRole('button', { name: 'Turn on AI' }))
    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    )
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitForElementToBeRemoved(() => screen.queryByTestId('ai-features-notice'))
    expect(screen.getByRole('button', { name: /Create preset/ })).toBeEnabled()
  })

  it('still lets an admin delete a preset', async () => {
    useScenario('ai-features-off')
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const row = await screen.findByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02')

    await userEvent.click(within(row).getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.type(screen.getByRole('textbox'), 'Platform (CLI-first)')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitForElementToBeRemoved(() => screen.queryByTestId('skill-preset-0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02'))
    expect(screen.getByText('Backend team')).toBeInTheDocument()
  })
})
