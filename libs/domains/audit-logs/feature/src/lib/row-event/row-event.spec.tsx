import {
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowEvent, { type RowEventProps } from './row-event'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({
    buildLocation: () => ({ href: '/' }),
  }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <a {...props} href={`${props.to}`}>
      {children}
    </a>
  ),
}))

const mockEvent: OrganizationEventResponse = eventsFactoryMock(1)[0]
const props: RowEventProps = {
  event: mockEvent,
  isPlaceholder: false,
  expanded: false,
  setExpanded: jest.fn(),
  columnsWidth: '',
}

describe('RowEvent', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowEvent {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 7 skeletons while loading', () => {
    renderWithProviders(<RowEvent {...props} isPlaceholder />)
    expect(screen.getAllByRole('generic', { busy: true })).toHaveLength(7)
  })

  it('should render 7 cells with good content', () => {
    renderWithProviders(<RowEvent {...props} />)

    screen.getByText(dateFullFormat(mockEvent.timestamp!))
    screen.getByTestId('tag')
    screen.getByText(upperCaseFirstLetter(mockEvent.target_type))
    screen.getByText(mockEvent.target_name!)
    screen.getByText(': ' + upperCaseFirstLetter(mockEvent.sub_target_type!)?.replace('_', ' '))
    screen.getByText(mockEvent.triggered_by!)
    screen.getByText(upperCaseFirstLetter(mockEvent.origin)!)
  })

  it('should show expanded panel on click', async () => {
    const { userEvent } = renderWithProviders(<RowEvent {...props} />)

    expect(screen.queryByTestId('expanded-panel')).not.toBeInTheDocument()
    const button = screen.getByTestId('row-event')

    await userEvent.click(button)
    expect(props.setExpanded).toHaveBeenCalledWith(true)
  })

  it('should render link for target', () => {
    renderWithProviders(<RowEvent {...props} />)
    const target = screen.getByText(props.event?.target_name || '')

    expect(target).toHaveAttribute('href', '/organization/1/settings')
  })

  it.each([
    OrganizationEventTargetType.APPLICATION,
    OrganizationEventTargetType.CONTAINER,
    OrganizationEventTargetType.JOB,
    OrganizationEventTargetType.HELM,
    OrganizationEventTargetType.TERRAFORM,
    OrganizationEventTargetType.DATABASE,
    OrganizationEventTargetType.AGENTIC_WORKFLOW,
  ])('should render unified service link for %s target', (targetType) => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          target_type: targetType,
          target_id: 'service-1',
          target_name: 'service-name',
          project_id: 'project-1',
          environment_id: 'environment-1',
        }}
      />
    )

    expect(screen.getByText('service-name')).toHaveAttribute(
      'href',
      '/organization/1/project/project-1/environment/environment-1/service/service-1/overview'
    )
  })

  it('should render an unsupported target type without crashing', () => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          target_type: 'NEW_TARGET_TYPE' as OrganizationEventTargetType,
          target_name: 'unsupported-target',
        }}
      />
    )

    expect(screen.getByText('unsupported-target')).not.toHaveAttribute('href')
  })

  it.each([OrganizationEventType.POLICY_FAILED, OrganizationEventType.ACCESS_DENIED])(
    'should render %s as a failed event',
    (eventType) => {
      renderWithProviders(<RowEvent {...props} event={{ ...props.event, event_type: eventType }} />)

      expect(screen.getByTestId('tag').querySelector('.text-negative')).toBeInTheDocument()
    }
  )

  it('should render an empty event label when the event type is missing', () => {
    renderWithProviders(
      <RowEvent {...props} event={{ ...props.event, event_type: undefined, sub_target_type: null }} />
    )

    expect(screen.getByTestId('tag')).toHaveTextContent(/^$/)
  })

  const operatorUpdateChange = JSON.stringify({
    operator: 'Jane Admin',
    operation: 'OPERATOR_UPDATE',
    execution_id: 'execution-1',
    chart_version: null,
    image_version: 'v9.999.0',
  })

  it.each([
    [OrganizationEventType.MAINTENANCE, 'Maintenance · Operator update'],
    [OrganizationEventType.TRIGGER_DEPLOY, 'Trigger Deploy · Operator update'],
  ])('should label a %s cluster event as an Operator update', (eventType, label) => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          event_type: eventType,
          target_type: OrganizationEventTargetType.CLUSTER,
          sub_target_type: null,
          change: operatorUpdateChange,
        }}
      />
    )

    expect(screen.getByTestId('tag')).toHaveTextContent(label)
  })

  const operatorUpdateEvent: OrganizationEventResponse = {
    ...props.event,
    event_type: OrganizationEventType.MAINTENANCE,
    target_type: OrganizationEventTargetType.CLUSTER,
    sub_target_type: null,
    change: operatorUpdateChange,
  }

  it('should reveal the full Operator update label on hover', async () => {
    const { userEvent } = renderWithProviders(<RowEvent {...props} event={operatorUpdateEvent} />)

    await userEvent.hover(screen.getByText('Maintenance'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Maintenance · Operator update')
  })

  it('should reveal the full Operator update label on keyboard focus', async () => {
    const { userEvent } = renderWithProviders(<RowEvent {...props} event={operatorUpdateEvent} />)

    await userEvent.tab()

    expect(screen.getByText('Maintenance').parentElement).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Maintenance · Operator update')
  })

  it.each([
    ['a cluster operation', JSON.stringify({ operation: 'CLUSTER' })],
    ['a change without operation', JSON.stringify({ execution_id: 'execution-1' })],
    ['a non-object change', JSON.stringify('OPERATOR_UPDATE')],
    ['a null change', 'null'],
    ['an invalid JSON change', '{"operation": "OPERATOR_UPDATE"'],
  ])('should not label a cluster event with %s as an Operator update', (_, change) => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          event_type: OrganizationEventType.MAINTENANCE,
          target_type: OrganizationEventTargetType.CLUSTER,
          sub_target_type: null,
          change,
        }}
      />
    )

    expect(screen.getByTestId('tag')).toHaveTextContent(/^Maintenance$/)
  })

  it('should not label a non-cluster event as an Operator update', () => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          event_type: OrganizationEventType.TRIGGER_DEPLOY,
          target_type: OrganizationEventTargetType.APPLICATION,
          sub_target_type: null,
          change: operatorUpdateChange,
        }}
      />
    )

    expect(screen.getByTestId('tag')).toHaveTextContent(/^Trigger Deploy$/)
  })

  it('should render Agent task for the agentic workflow target type', () => {
    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          target_type: OrganizationEventTargetType.AGENTIC_WORKFLOW,
        }}
      />
    )

    expect(screen.getByText('Agent task')).toBeInTheDocument()
  })

  it.each([
    [OrganizationEventTargetType.ORGANIZATION, '/organization/1/settings'],
    [OrganizationEventTargetType.MEMBERS_AND_ROLES, '/organization/1/settings/members'],
    [OrganizationEventTargetType.PROJECT, '/organization/1/project/project-1/settings/general'],
    [OrganizationEventTargetType.ENVIRONMENT, '/organization/1/project/project-1/environment/environment-1'],
    [OrganizationEventTargetType.CLUSTER, '/organization/1/cluster/cluster-1/settings'],
    [OrganizationEventTargetType.WEBHOOK, '/organization/1/settings/webhook'],
    [OrganizationEventTargetType.CONTAINER_REGISTRY, '/organization/1/settings/container-registries'],
    [OrganizationEventTargetType.ENTERPRISE_CONNECTION, '/organization/1/settings/members'],
    [OrganizationEventTargetType.HELM_REPOSITORY, '/organization/1/settings/helm-repositories'],
  ])('should render valid console v5 link for %s target', (targetType, href) => {
    const targetIdByType: Partial<Record<OrganizationEventTargetType, string>> = {
      [OrganizationEventTargetType.PROJECT]: 'project-1',
      [OrganizationEventTargetType.ENVIRONMENT]: 'environment-1',
      [OrganizationEventTargetType.CLUSTER]: 'cluster-1',
    }

    renderWithProviders(
      <RowEvent
        {...props}
        event={{
          ...props.event,
          target_type: targetType,
          target_id: targetIdByType[targetType] ?? 'target-1',
          target_name: 'target-name',
          project_id: 'project-1',
          environment_id: 'environment-1',
        }}
      />
    )

    expect(screen.getByText('target-name')).toHaveAttribute('href', href)
  })
})
