import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations, selectAllOrganizations } from '../slices/organizations.slice'

export function useOrganizations() {
  const dispatch = useDispatch()
  const organizations = useSelector(selectAllOrganizations)

  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  return [organizations]
}
