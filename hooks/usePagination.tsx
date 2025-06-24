import { useState, useEffect } from 'react'

interface UsePaginationProps {
  fetchData: (page: number, limit: number) => Promise<any>
  itemsPerPage?: number
}

interface PaginationResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function usePagination({ fetchData, itemsPerPage = 10 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: itemsPerPage,
    total: 0,
    pages: 0
  })

  const loadData = async (page: number, limit: number) => {
    setLoading(true)
    try {
      const response: PaginationResponse = await fetchData(page, limit)
      if (response.data && response.pagination) {
        setData(response.data)
        setPagination(response.pagination)
      } else {
        // Fallback for non-paginated responses
        setData(Array.isArray(response) ? response : [])
        setPagination({
          page: 1,
          limit: Array.isArray(response) ? response.length : 0,
          total: Array.isArray(response) ? response.length : 0,
          pages: 1
        })
      }
    } catch (error) {
      console.error('Pagination error:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(currentPage, pageSize)
  }, [currentPage, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changePageSize = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const refresh = () => {
    loadData(currentPage, pageSize)
  }

  return {
    currentPage,
    totalPages: pagination.pages,
    pageSize,
    paginatedData: data,
    loading,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    refresh,
    hasNextPage: currentPage < pagination.pages,
    hasPreviousPage: currentPage > 1,
    totalItems: pagination.total,
    startIndex: ((currentPage - 1) * pageSize) + 1,
    endIndex: Math.min(currentPage * pageSize, pagination.total)
  }
}

// Client-side pagination for backward compatibility
export function useClientPagination({ data, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changePageSize = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalItems: data.length,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, data.length)
  }
}