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

  it('should have 3 sections', () => {
    const { baseElement } = render(<ClusterEksSettings />)
    const sections = baseElement.querySelectorAll('section')
    expect(sections).toHaveLength(3)
    expect(sections[0].querySelector('h2')?.textContent).toBe('Cert Manager')
    expect(sections[1].querySelector('h2')?.textContent).toBe('MetalLB')
    expect(sections[2].querySelector('h2')?.textContent).toBe('Nginx')
  })
})
