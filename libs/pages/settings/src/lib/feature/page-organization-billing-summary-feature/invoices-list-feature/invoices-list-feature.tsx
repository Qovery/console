import { Invoice } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  downloadAllInvoices,
  fetchInvoiceUrl,
  fetchInvoices,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { Value } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import InvoicesList from '../../../ui/page-organization-billing-summary/invoices-list/invoices-list'

export const getListOfYears = (invoices: Invoice[]) => {
  const years = invoices.map((invoice) => new Date(invoice.created_at).getFullYear())
  return [...new Set(years)].sort((a, b) => b - a)
}

export function InvoicesListFeature() {
  const { organizationId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId || ''))
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [yearsFilterOptions, setYearsFilterOptions] = useState<Value[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchInvoices({ organizationId }))
    }
  }, [organizationId, dispatch])

  const downloadOne = (invoiceId: string) => {
    if (organizationId && invoiceId) {
      dispatch(fetchInvoiceUrl({ organizationId, invoiceId }))
        .unwrap()
        .then((data) => {
          window.open(data.url, '_blank')
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }

  const downloadAll = () => {
    if (organizationId) {
      setDownloadLoading(true)
      dispatch(downloadAllInvoices({ organizationId }))
        .unwrap()
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setDownloadLoading(false)
        })
    }
  }

  useEffect(() => {
    if (organization?.invoices?.items && organization.invoices.items.length > 0) {
      setInvoices(organization.invoices.items)
      const years = getListOfYears(organization.invoices.items)
      setYearsFilterOptions([
        { label: 'Filter by year', value: '' },
        ...years.map((year) => ({ label: `${year}`, value: `${year}` })),
      ])
    }
  }, [organization])

  const filterByYear = (year?: string) => {
    if (organization?.invoices?.items && organization.invoices.items.length > 0) {
      if (!year) return setInvoices(organization.invoices.items)

      const filteredInvoices = organization.invoices.items.filter((invoice) => {
        const invoiceYear = new Date(invoice.created_at).getFullYear()
        return invoiceYear === parseInt(year, 10)
      })
      setInvoices(filteredInvoices)
    }
  }

  return (
    <InvoicesList
      invoices={invoices}
      invoicesLoading={!organization?.invoices?.loadingStatus || organization.invoices.loadingStatus === 'loading'}
      downloadAll={downloadAll}
      downloadLoading={downloadLoading}
      downloadOne={downloadOne}
      yearsForSorting={yearsFilterOptions}
      onFilterByYear={filterByYear}
    />
  )
}

export default InvoicesListFeature
