import { createContext } from 'react'

interface UpdateTimeContextProps {
  utc: boolean
  setUpdateTimeContext?: (data: { utc: boolean }) => void
}

export const defaultUpdateTimeContext = {
  utc: false,
}

export const UpdateTimeContext = createContext<UpdateTimeContextProps>(defaultUpdateTimeContext)
