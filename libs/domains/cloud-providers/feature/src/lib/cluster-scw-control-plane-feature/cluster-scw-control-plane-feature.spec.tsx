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
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>
      )
    )
    expect(screen.getByText('Control plane type')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })

  it('displays the additional costs callout when dedicated control plane is selected', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={false} />
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
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>
      )
    )

    expect(CONTROL_PLANE_LABELS.KAPSULE).toBe('Mutualized')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED4).toBe('Dedicated 4')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED8).toBe('Dedicated 8')
    expect(CONTROL_PLANE_LABELS.KAPSULE_DEDICATED16).toBe('Dedicated 16')
  })

  it('sets KAPSULE_DEDICATED4 as default value for production environments', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={true} />
        </Section>
      )
    )

    expect(screen.getByText('Dedicated 4: 4 GB / 2vCPU / 250 nodes')).toBeInTheDocument()
  })

  it('shows downgrade warning when selecting a lower stier after a higher one', async () => {
    const { rerender } = renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>,
        {
          defaultValues: {
            scw_control_plane: 'KAPSULE_DEDICATED16',
          },
        }
      )
    )

    rerender(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>,
        {
          defaultValues: {
            scw_control_plane: 'KAPSULE_DEDICATED16',
          },
        }
      )
    )

    await selectEvent.select(screen.getByLabelText('Type'), 'Dedicated 4', {
      container: document.body,
    })

    expect(screen.getByText(/Please note that there is a 30-day commitment period/)).toBeInTheDocument()
  })

  it('does not show any warning when mutualized plan is selected initially', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>
      )
    )

    expect(screen.queryByText(/additional costs will be incurred/)).not.toBeInTheDocument()
    expect(screen.queryByText(/30-day commitment period/)).not.toBeInTheDocument()
  })

  it('displays the correct specifications when selecting different control plane types', async () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <ClusterSCWControlPlaneFeature production={false} />
        </Section>
      )
    )

    const selectInput = screen.getByLabelText('Type')

    await selectEvent.select(selectInput, 'Dedicated 8', {
      container: document.body,
    })

    expect(screen.getByText('Dedicated 8: 8 GB / 2vCPU / 500 nodes')).toBeInTheDocument()
  })
})
