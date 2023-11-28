import { renderWithProviders } from '@qovery/shared/util-tests'
import { type Pod, PodDetails } from './pod-details'

describe('PodDetails', () => {
  it('should match snapshot with git based pod and without last_terminated_state', () => {
    const pod: Pod = {
      podName: 'foobar',
      service_version: 'abcd',
      containers: [
        {
          name: 'pod-container-1',
          image: 'foobar-img',
          current_state: {
            state: 'RUNNING',
          },
          restart_count: 0,
        },
      ],
    }
    const { baseElement } = renderWithProviders(<PodDetails pod={pod} serviceId="1" serviceType="APPLICATION" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot with git based pod and with last_terminated_state', () => {
    const pod: Pod = {
      podName: 'foobar',
      service_version: 'abcd',
      containers: [
        {
          name: 'pod-container-1',
          current_state: {
            state: 'RUNNING',
          },
          image: 'foobar-img',
          last_terminated_state: {
            exit_code: 1,
            exit_code_message: 'baz',
            message: 'baz',
            reason: 'baz reason',
            signal: 3,
            finished_at: 1696923386000,
          },
          restart_count: 0,
        },
      ],
    }
    const { baseElement } = renderWithProviders(<PodDetails pod={pod} serviceId="1" serviceType="APPLICATION" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot with container based pod and with multiple containers', () => {
    const pod: Pod = {
      podName: 'foobar',
      containers: [
        {
          name: 'pod-container-1',
          current_state: {
            state: 'RUNNING',
          },
          image: 'foobar-img',
          restart_count: 0,
        },
        {
          name: 'pod-container-2',
          current_state: {
            state: 'ERROR',
          },
          image: 'foobar-img',
          last_terminated_state: {
            exit_code: 1,
            exit_code_message: 'baz',
            message: 'baz',
            reason: 'baz reason',
            signal: 3,
          },
          restart_count: 0,
        },
      ],
    }
    const { baseElement } = renderWithProviders(<PodDetails pod={pod} serviceId="1" serviceType="HELM" />)
    expect(baseElement).toMatchSnapshot()
  })
})
