import { type ReactNode } from 'react'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceSettingsLayout } from './service-settings-layout'

let mockService = terraformFactoryMock(1)[0]

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({
    organizationId: 'organization-id',
    projectId: 'project-id',
    environmentId: 'environment-id',
    serviceId: 'service-id',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({ data: mockService }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Sidebar: {
    Root: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
    Item: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
    Group: ({ children, title }: { children: ReactNode; title: string }) => (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    ),
    SubItem: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  },
}))

describe('ServiceSettingsLayout', () => {
  it('hides Terraform-only settings for blueprint services', () => {
    mockService = { ...terraformFactoryMock(1)[0], blueprint_id: 'blueprint-id' }

    renderWithProviders(
      <ServiceSettingsLayout>
        <div>Settings content</div>
      </ServiceSettingsLayout>
    )

    expect(screen.queryByText('Terraform configuration')).not.toBeInTheDocument()
    expect(screen.queryByText('Terraform arguments')).not.toBeInTheDocument()
    expect(screen.getByText('Blueprint configuration')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.queryByText('Deployment restrictions')).not.toBeInTheDocument()
  })

  it('keeps Terraform-only settings for regular Terraform services', () => {
    mockService = terraformFactoryMock(1)[0]

    renderWithProviders(
      <ServiceSettingsLayout>
        <div>Settings content</div>
      </ServiceSettingsLayout>
    )

    expect(screen.getByText('Terraform configuration')).toBeInTheDocument()
    expect(screen.getByText('Terraform arguments')).toBeInTheDocument()
    expect(screen.queryByText('Blueprint configuration')).not.toBeInTheDocument()
    expect(screen.getByText('Deployment restrictions')).toBeInTheDocument()
  })
})
