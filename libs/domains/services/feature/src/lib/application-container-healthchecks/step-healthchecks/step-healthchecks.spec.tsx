import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerCreationFlow } from '../../service-creation-flow/application-container/application-container-creation-flow'
import { ApplicationContainerStepHealthchecks } from './step-healthchecks'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org',
    projectId: 'proj',
    environmentId: 'env',
    slug: 'application',
  }),
  useSearch: () => ({}),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}))

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

describe('ApplicationContainerStepHealthchecks', () => {
  it('renders successfully', () => {
    renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/organization/org/project/proj/environment/env/service/create/application">
        <ApplicationContainerStepHealthchecks onBack={jest.fn()} onSubmit={jest.fn()} />
      </ApplicationContainerCreationFlow>
    )

    expect(screen.getByRole('heading', { name: 'Health checks' })).toBeInTheDocument()
  })
})
