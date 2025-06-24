"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { apiClient, type ListResponse, type SearchResult } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertWithIcon } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react'

interface DataManagementProps {
  entityType: 'users' | 'applications' | 'payments' | 'countries' | 'visa-types' | 'notifications'
  title: string
  description?: string
  allowCreate?: boolean
  allowEdit?: boolean
  allowDelete?: boolean
  allowExport?: boolean
}

export function DataManagement({
  entityType,
  title,
  description,
  allowCreate = false,
  allowEdit = false,
  allowDelete = false,
  allowExport = false
}: DataManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data based on entity type
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      }
      
      let response: ListResponse<any>
      
      switch (entityType) {
        case 'users':
          response = await apiClient.listUsers(params)
          break
        case 'applications':
          response = await apiClient.listApplications(params)
          break
        case 'payments':
          response = await apiClient.listPayments(params)
          break
        case 'countries':
          response = await apiClient.listCountries(params)
          break
        case 'visa-types':
          response = await apiClient.listVisaTypes(params)
          break
        case 'notifications':
          response = await apiClient.listNotifications(params)
          break
        default:
          throw new Error(`Unsupported entity type: ${entityType}`)
      }
      
      setData(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(data.map(item => item._id || item.id))
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items selected',
        description: 'Please select items to perform bulk actions'
      })
      return
    }

    try {
      switch (action) {
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
            // Implement bulk delete based on entity type
            await handleBulkDelete()
          }
          break
        case 'export':
          await handleBulkExport()
          break
        default:
          toast({
            variant: 'destructive',
            title: 'Invalid action',
            description: 'The selected action is not supported'
          })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk action failed'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      })
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    // Implementation depends on entity type
    console.log('Bulk delete:', selectedItems)
    setSelectedItems([])
    await fetchData()
  }

  // Handle bulk export
  const handleBulkExport = async () => {
    try {
      let response
      switch (entityType) {
        case 'applications':
          response = await apiClient.exportApplicationsCSV(filters)
          break
        case 'payments':
          response = await apiClient.exportPaymentsCSV(filters)
          break
        case 'users':
          response = await apiClient.exportUsersCSV(filters)
          break
        default:
          throw new Error('Export not supported for this entity type')
      }
      
      // Handle CSV download
      const blob = new Blob([response], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entityType}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        variant: 'success',
        title: 'Export successful',
        description: 'Data has been exported to CSV file'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      toast({
        variant: 'destructive',
        title: 'Export Error',
        description: errorMessage
      })
    }
  }

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'inactive':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
      case 'under_review':
      case 'created':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  // Get entity icon
  const getEntityIcon = () => {
    switch (entityType) {
      case 'users':
        return <Users className="h-5 w-5" />
      case 'applications':
        return <FileText className="h-5 w-5" />
      case 'payments':
        return <CreditCard className="h-5 w-5" />
      case 'notifications':
        return <Bell className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  // Render table columns based on entity type
  const renderTableHeaders = () => {
    switch (entityType) {
      case 'users':
        return (
          <>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </>
        )
      case 'applications':
        return (
          <>
            <TableHead>Application #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Visa Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </>
        )
      case 'payments':
        return (
          <>
            <TableHead>Payment ID</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </>
        )
      case 'countries':
        return (
          <>
            <TableHead>Flag</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Processing Time</TableHead>
            <TableHead>Status</TableHead>
          </>
        )
      case 'visa-types':
        return (
          <>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Processing Days</TableHead>
            <TableHead>Status</TableHead>
          </>
        )
      case 'notifications':
        return (
          <>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </>
        )
      default:
        return <TableHead>Data</TableHead>
    }
  }

  // Render table rows based on entity type
  const renderTableRow = (item: any) => {
    switch (entityType) {
      case 'users':
        return (
          <>
            <TableCell>{item.firstName} {item.lastName}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.userType}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
          </>
        )
      case 'applications':
        return (
          <>
            <TableCell className="font-medium">{item.applicationNumber}</TableCell>
            <TableCell>
              {item.customerId ? `${item.customerId.firstName} ${item.customerId.lastName}` : 'N/A'}
            </TableCell>
            <TableCell>{item.countryId?.name || item.country_name}</TableCell>
            <TableCell>{item.visaTypeId?.name || item.visa_type_name}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Not submitted'}
            </TableCell>
          </>
        )
      case 'payments':
        return (
          <>
            <TableCell className="font-medium">{item.razorpayOrderId}</TableCell>
            <TableCell>{item.applicationId?.applicationNumber || 'N/A'}</TableCell>
            <TableCell>₹{item.amount}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
          </>
        )
      case 'countries':
        return (
          <>
            <TableCell>{item.flagEmoji}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.code}</TableCell>
            <TableCell>{item.processingTimeMin}-{item.processingTimeMax} days</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.isActive ? 'active' : 'inactive')}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
          </>
        )
      case 'visa-types':
        return (
          <>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.countryId?.name || 'N/A'}</TableCell>
            <TableCell>₹{item.fee}</TableCell>
            <TableCell>{item.processingTimeDays} days</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.isActive ? 'active' : 'inactive')}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
          </>
        )
      case 'notifications':
        return (
          <>
            <TableCell>{item.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell>
              {item.userId ? `${item.userId.firstName} ${item.userId.lastName}` : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.isRead ? 'read' : 'unread')}>
                {item.isRead ? 'Read' : 'Unread'}
              </Badge>
            </TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
          </>
        )
      default:
        return <TableCell>{JSON.stringify(item)}</TableCell>
    }
  }

  // Render filters based on entity type
  const renderFilters = () => {
    if (!showFilters) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entityType === 'applications' && (
              <>
                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
              </>
            )}
            
            {entityType === 'users' && (
              <>
                <div>
                  <Label>User Type</Label>
                  <Select onValueChange={(value) => handleFilterChange('userType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {entityType === 'payments' && (
              <>
                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({})
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={fetchData}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [entityType, searchQuery, filters, pagination.page, pagination.limit, sortBy, sortOrder])

  if (!user) {
    return (
      <AlertWithIcon
        variant="destructive"
        title="Access Denied"
        description="You must be logged in to view this data."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getEntityIcon()}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {allowExport && (
            <Button variant="outline" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {allowCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Search ${entityType}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {renderFilters()}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex items-center space-x-2">
                {allowDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <AlertWithIcon
          variant="destructive"
          title="Error"
          description={error}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading...
            </div>
          ) : data.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500">No {entityType} found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    {renderTableHeaders()}
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item._id || item.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id || item.id)}
                          onChange={() => handleItemSelect(item._id || item.id)}
                          className="rounded"
                        />
                      </TableCell>
                      {renderTableRow(item)}
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {allowEdit && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {allowDelete && (
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DataManagement