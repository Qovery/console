import { Value } from '@qovery/shared/interfaces'
import { InputFilter } from '@qovery/shared/ui'

/* eslint-disable-next-line */
export interface CustomFilterProps {}

export function CustomFilter(props: CustomFilterProps) {
  const handeChangeType = (value: string | string[]) => {
    console.log(value)
  }

  const optionsType: Value[] = [
    {
      label: 'Test 1',
      value: 'test1',
    },
    {
      label: 'Test 2',
      value: 'test2',
    },
  ]

  const optionsProject: Value[] = [
    {
      label: 'Test 1',
      value: 'test1',
    },
    {
      label: 'Test 2',
      value: 'test2',
    },
  ]

  return (
    <div className="flex items-center relative z-20 text-text-400 text-ssm font-medium">
      <p className=" mr-1.5">Search</p>
      <InputFilter name="Type" options={optionsType} onChange={handeChangeType} />
      <span className="mx-1.5">in</span>
      <InputFilter name="Project" options={optionsProject} onChange={handeChangeType} />
    </div>
  )
}

export default CustomFilter
