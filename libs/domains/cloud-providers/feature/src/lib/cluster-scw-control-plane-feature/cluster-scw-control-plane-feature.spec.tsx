import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { Section } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  CONTROL_PLANE_LABELS,
  ClusterSCWControlPlaneFeature,
  SCW_CONTROL_PLANE_FEATURE_ID,
} from './cluster-scw-control-plane-feature'

const mockSCW_CONTROL_PLANE_FEATURE_ID = SCW_CONTROL_PLANE_FEATURE_ID

jest.mock('../hooks/use-cloud-provider-features/use-cloud-provider-features', () => {
  return {
    ...jest.requireActual('../hooks/use-cloud-provider-features/use-cloud-provider-features'),
    useCloudProviderFeatures: () => ({
      data: [
        {
          id: mockSCW_CONTROL_PLANE_FEATURE_ID,
          name: 'Control Plane Type',
          description: 'The type of Scaleway control plane',
          accepted_values: ['KAPSULE', 'KAPSULE_DEDICATED4', 'KAPSULE_DEDICATED8', 'KAPSULE_DEDICATED16'],
        },
      ],
    }),
  }
})

describe('ClusterSCWControlPlaneFeature', () => {
  it('renders the control plane feature component with options', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature />
        </Section>
      )
    )
    expect(screen.getByText('Control plane type')).toBeInTheDocument()
  })

  it('displays the mutualized callout when KAPSULE is selected and form is dirty', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature />
        </Section>
      )
    )
    await selectEvent.select(screen.getByLabelText('Type'), 'Dedicated 8', {
      container: document.body,
    })
    expect(screen.getByText(/By selecting this control plane, additional costs will be incurred/)).toBeInTheDocument()
  })

  it('maps feature values to proper display labels', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature />
        </Section>
      )
    )

    expect(CONTROL_PLANE_LABELS.KAPSULE).toBe('Mutualized')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED4).toBe('Dedicated 4')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED8).toBe('Dedicated 8')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED16).toBe('Dedicated 16')
  })
})
