import TableRowServicesFeature, { TableRowServicesFeatureProps } from './table-row-services-feature'
import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@console/domains/application'

const props: TableRowServicesFeatureProps = {
  data: applicationFactoryMock(1)[0],
  environmentMode: 'prod',
  link: '#',
  dataHead: [
    {
      title: `service`,
      className: 'px-4 py-2',
      filter: [
        {
          search: true,
          title: 'Filter by status',
          key: 'status.state',
        },
      ],
    },
    {
      title: 'Update',
      className: 'px-4 text-center',
      sort: {
        key: 'updated_at',
      },
    },
    {
      title: 'Commit',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
    },
    {
      title: 'Type',
    },
    {
      title: 'Tags',
    },
  ],
}

describe('TableRowServicesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowServicesFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
