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
  it('should match snapshot with pod error with 0 containers', () => {
    const pod: Pod = {
      name: 'app-z0fb41d62-5c7fdb6f5f-44wpd',
      state: 'ERROR',
      state_reason: 'Evicted',
      state_message: 'Pod was rejected: The node had condition: [DiskPressure]. ',
      restart_count: 0,
      containers: [],
      started_at: 1702309622000,
      service_version: 'd921f8b5107f35d7b06f859a2a133a2b0a189160',
      podName: 'app-z0fb41d62-5c7fdb6f5f-44wpd',
    }
    const { baseElement } = renderWithProviders(<PodDetails pod={pod} serviceId="1" serviceType="APPLICATION" />)
    expect(baseElement).toMatchSnapshot()
  })
})
