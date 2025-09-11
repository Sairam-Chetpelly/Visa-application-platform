import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
          >
            First
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  )
}