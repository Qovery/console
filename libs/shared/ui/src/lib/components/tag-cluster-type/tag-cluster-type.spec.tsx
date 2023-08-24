import { render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import TagClusterType, { type TagClusterTypeProps } from './tag-cluster-type'

describe('TagClusterType', () => {
  let props: TagClusterTypeProps = {
    cloudProvider: CloudProviderEnum.AWS,
    kubernetes: KubernetesEnum.MANAGED,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TagClusterType {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render content for AWS and Managed', () => {
    const { baseElement } = render(<TagClusterType {...props} />)
    expect(baseElement.textContent).toBe('Managed (EKS)')
  })

  it('should render content for AWS and K3S', () => {
    props = {
      cloudProvider: CloudProviderEnum.AWS,
      kubernetes: KubernetesEnum.K3_S,
    }

    const { baseElement } = render(<TagClusterType {...props} />)
    expect(baseElement.textContent).toBe('EC2 (K3S)')
  })

  it('should render content for Scaleway', () => {
    props = {
      cloudProvider: CloudProviderEnum.SCW,
    }

    const { baseElement } = render(<TagClusterType {...props} />)
    expect(baseElement.textContent).toBe('Managed (Kapsule)')
  })

  it('should render content for DO', () => {
    props = {
      cloudProvider: CloudProviderEnum.DO,
    }

    const { baseElement } = render(<TagClusterType {...props} />)
    expect(baseElement.textContent).toBe('Managed (DOKS)')
  })
})
