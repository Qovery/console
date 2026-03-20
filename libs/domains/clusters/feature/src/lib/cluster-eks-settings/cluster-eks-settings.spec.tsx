import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ReactNode } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterEksSettings } from './cluser-eks-settings'

const render = (component: ReactNode) => {
  return renderWithProviders(wrapWithReactHookForm(component))
}

describe('ClusterEksSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterEksSettings />)
    expect(baseElement).toBeTruthy()
  })

  it('should have 4 sections', () => {
    const { baseElement } = render(<ClusterEksSettings />)
    const sections = baseElement.querySelectorAll('section')
    expect(sections).toHaveLength(4)
    expect(sections[0]).toHaveTextContent('Infrastructure charts source')
    expect(sections[1]).toHaveTextContent('Cert Manager')
    expect(sections[2]).toHaveTextContent('MetalLB')
    expect(sections[3]).toHaveTextContent('Nginx')
  })
})
