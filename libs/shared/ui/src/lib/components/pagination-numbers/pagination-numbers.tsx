import { useEffect, useState } from 'react'

export interface PaginationNumbersProps {
  nextDisabled?: boolean
  previousDisabled?: boolean
  className?: string
  onNext: () => void
  onPrevious: () => void
  currentPage: number
  pageSize?: string
  onPageSizeChange?: (pageSize: string) => void
}

export function PaginationNumbers(props: PaginationNumbersProps) {
  const { currentPage } = props

  const [displayedPages, setDisplayedPages] = useState<any>([])

  // Met à jour les pages affichées en fonction de la page actuelle
  const updateDisplayedPages = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 3)

    pages.push(startPage)
    pages.push(startPage + 1)

    setDisplayedPages(pages)
  }

  // Appelé lorsque la page actuelle change
  const handlePageChange = (page: number) => {
    // onPageChange(page)
    updateDisplayedPages()
  }

  // Effectue la mise à jour des pages affichées lors du montage initial
  useEffect(() => {
    updateDisplayedPages()
  }, [])

  return (
    <div className="pagination">
      <button onClick={() => handlePageChange(currentPage - 1)}>Prev</button>
      {displayedPages.map((page: any) => (
        <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => handlePageChange(page)}>
          {page}
        </button>
      ))}
      <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
    </div>
  )

  // return (
  //   <div className={`flex justify-between ${props.className || ''}`}>
  //     <div className="flex gap-0.5 items-center">
  //       <ButtonIcon
  //         dataTestId="button-previous-page"
  //         icon={IconAwesomeEnum.CHEVRON_LEFT}
  //         style={ButtonIconStyle.STROKED}
  //         size={ButtonSize.SMALL}
  //         className="!w-8"
  //         disabled={props.previousDisabled}
  //         onClick={() => props.onPrevious()}
  //         iconClassName="!text-xs"
  //       />
  //       <ButtonIcon
  //         dataTestId="button-next-page"
  //         icon={IconAwesomeEnum.CHEVRON_RIGHT}
  //         style={ButtonIconStyle.STROKED}
  //         size={ButtonSize.SMALL}
  //         className="!w-8"
  //         disabled={props.nextDisabled}
  //         onClick={() => props.onNext()}
  //         iconClassName="!text-xs"
  //       />
  //     </div>
  //     <div className="flex gap-3 items-center">
  //       <InputSelectSmall
  //         dataTestId="select-page-size"
  //         name="pageSize"
  //         className="!w-16"
  //         defaultValue={props.pageSize || '10'}
  //         onChange={(e) => props.onPageSizeChange && props.onPageSizeChange(e || '')}
  //         items={[
  //           {
  //             label: '10',
  //             value: '10',
  //           },
  //           {
  //             label: '30',
  //             value: '30',
  //           },
  //           {
  //             label: '50',
  //             value: '50',
  //           },
  //         ]}
  //       />
  //     </div>
  //   </div>
  // )
}

export default PaginationNumbers
