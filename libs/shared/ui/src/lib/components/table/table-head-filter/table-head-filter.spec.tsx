import { render } from '__tests__/utils/setup-jest'
import TableHeadFilter, { type TableHeadFilterProps, createFilter } from './table-head-filter'

describe('TableHeadFilter', () => {
  const props: TableHeadFilterProps = {
    title: 'Environment',
    dataHead: {
      title: 'Environment',
      className: 'px-4 py-2',
    },
    defaultData: [],
    setFilter: jest.fn(),
    filter: [],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TableHeadFilter {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have function render correct list of menus', () => {
    props.dataHead = {
      title: 'Title',
      filter: [
        {
          key: 'mode',
        },
      ],
    }

    props.defaultData = [
      {
        mode: 'DEVELOPMENT',
      },
      {
        mode: 'PRODUCTION',
      },
      {
        mode: 'STAGING',
      },
      {
        mode: 'STAGING',
      },
    ]

    const defaultValue = 'ALL'

    const testCreateFilter = createFilter(
      props.dataHead,
      props.defaultData,
      defaultValue,
      '',
      jest.fn(),
      jest.fn(),
      jest.fn()
    )

    const items = testCreateFilter[0].items.map((item) => item['name'])
    expect(items.toString()).toContain(['All', 'Development', 'Production', 'Staging'].toString())
  })

  it('should have function render correct list of menus with custom items', () => {
    props.dataHead = {
      title: 'Title',
      filter: [
        {
          key: 'origin',
          itemsCustom: ['origin-1', 'origin-2'],
          hideFilterNumber: true,
        },
      ],
    }

    const testCreateFilter = createFilter(props.dataHead, [], 'ALL', '', jest.fn(), jest.fn(), jest.fn(), jest.fn())

    const items = testCreateFilter[0].items.map((item) => item['name'])
    expect(items.toString()).toContain(['Origin-1', 'Origin-2'].toString())
  })

  it('should have function render correct list of menus with custom item', () => {
    props.dataHead = {
      title: 'Title',
      filter: [
        {
          key: 'mode',
          itemContentCustom: (data) => <p>{data.mode}</p>,
        },
      ],
    }

    props.defaultData = [
      {
        mode: 'DEVELOPMENT',
      },
      {
        mode: 'PRODUCTION',
      },
      {
        mode: 'STAGING',
      },
      {
        mode: 'STAGING',
      },
    ]

    const defaultValue = 'ALL'

    const testCreateFilter = createFilter(
      props.dataHead,
      props.defaultData,
      defaultValue,
      '',
      jest.fn(),
      jest.fn(),
      jest.fn()
    )

    testCreateFilter[0].items.map((item) => {
      expect(item.itemContentCustom?.props?.children).toBe(item.name.toUpperCase())
    })
  })
})
