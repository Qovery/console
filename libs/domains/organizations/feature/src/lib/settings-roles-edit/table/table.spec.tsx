import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Table, { type TableProps } from './table'

type TestCase = {
  label: string
  tooltip: string
}

const headArray: TestCase[] = [
  {
    label: 'Full-Access',
    tooltip: 'tooltip',
  },
  {
    label: 'Read-Only',
    tooltip: 'tooltip-2',
  },
]

const props: TableProps = {
  title: 'Cluster level permissions',
  headArray,
  children: <p>children</p>,
}

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Table {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the title, headers, and children', () => {
    renderWithProviders(<Table {...props} />)

    expect(screen.getByText('Cluster level permissions')).toBeInTheDocument()
    expect(screen.getByText('Full-Access')).toBeInTheDocument()
    expect(screen.getByText('Read-Only')).toBeInTheDocument()
    expect(screen.getByText('children')).toBeInTheDocument()
  })
})
