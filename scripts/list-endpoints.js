// Comprehensive List Fetch Endpoints for Database
// This file contains all the list endpoints for fetching data from the database

// Import required modules
import { 
  User, 
  CustomerProfile, 
  EmployeeProfile, 
  Country, 
  VisaType, 
  VisaApplication, 
  ApplicationDocument, 
  ApplicationStatusHistory, 
  Notification, 
  PaymentOrder, 
  SystemSettings 
} from './mongodb-models.js'

// Helper function to apply filters, sorting, and pagination
const applyQueryOptions = (query, options = {}) => {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    filters = {}
  } = options

  // Apply search if provided
  if (search) {
    // This will be customized per endpoint based on searchable fields
    query = query.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    })
  }

  // Apply filters
  if (Object.keys(filters).length > 0) {
    query = query.find(filters)
  }

  // Apply sorting
  const sortObj = {}
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1
  query = query.sort(sortObj)

  // Apply pagination
  const skip = (page - 1) * limit
  query = query.skip(skip).limit(parseInt(limit))

  return query
}

// List all users with filtering and pagination
const listUsers = async (req, res) => {
  try {
    const { userType, status, search, page = 1, limit = 50 } = req.query
    
    let filter = {}
    if (userType) filter.userType = userType
    if (status) filter.status = status
    
    let query = User.find(filter)
    
    // Apply search
    if (search) {
      query = query.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    }
    
    // Get total count for pagination
    const total = await User.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const users = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-passwordHash') // Exclude password hash
    
    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List all countries with visa types
const listCountries = async (req, res) => {
  try {
    const { isActive, search, includeVisaTypes = true } = req.query
    
    let filter = {}
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    
    let query = Country.find(filter)
    
    // Apply search
    if (search) {
      query = query.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ]
      })
    }
    
    const countries = await query.sort({ name: 1 })
    
    // Include visa types if requested
    if (includeVisaTypes === 'true') {
      const countriesWithVisaTypes = await Promise.all(
        countries.map(async (country) => {
          const visaTypes = await VisaType.find({ 
            countryId: country._id, 
            isActive: true 
          })
          
          return {
            ...country.toObject(),
            visaTypes
          }
        })
      )
      
      res.json({ data: countriesWithVisaTypes })
    } else {
      res.json({ data: countries })
    }
  } catch (error) {
    console.error('Error listing countries:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List all visa types
const listVisaTypes = async (req, res) => {
  try {
    const { countryId, isActive, search, page = 1, limit = 50 } = req.query
    
    let filter = {}
    if (countryId) filter.countryId = countryId
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    
    let query = VisaType.find(filter).populate('countryId', 'name code flagEmoji')
    
    // Apply search
    if (search) {
      query = query.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    }
    
    // Get total count
    const total = await VisaType.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const visaTypes = await query
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: visaTypes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing visa types:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List all applications with comprehensive filtering
const listApplications = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      countryId, 
      visaTypeId, 
      customerId, 
      assignedTo,
      dateFrom,
      dateTo,
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    let filter = {}
    
    // Apply filters
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status }
      } else {
        filter.status = status
      }
    }
    if (priority) filter.priority = priority
    if (countryId) filter.countryId = countryId
    if (visaTypeId) filter.visaTypeId = visaTypeId
    if (customerId) filter.customerId = customerId
    if (assignedTo) filter.assignedTo = assignedTo
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }
    
    let query = VisaApplication.find(filter)
      .populate('customerId', 'firstName lastName email')
      .populate('countryId', 'name code flagEmoji')
      .populate('visaTypeId', 'name fee processingTimeDays')
      .populate('assignedTo', 'firstName lastName')
    
    // Apply search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query = query.find({
        $or: [
          { applicationNumber: searchRegex },
          { purposeOfVisit: searchRegex },
          { 'customerId.firstName': searchRegex },
          { 'customerId.lastName': searchRegex },
          { 'customerId.email': searchRegex }
        ]
      })
    }
    
    // Get total count
    const total = await VisaApplication.countDocuments(query.getFilter())
    
    // Apply sorting and pagination
    const sortObj = {}
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    const applications = await query
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing applications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List all payments
const listPayments = async (req, res) => {
  try {
    const { 
      status, 
      customerId, 
      applicationId,
      dateFrom,
      dateTo,
      search, 
      page = 1, 
      limit = 50 
    } = req.query
    
    let filter = {}
    
    // Apply filters
    if (status) filter.status = status
    if (customerId) filter['applicationId.customerId'] = customerId
    if (applicationId) filter.applicationId = applicationId
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }
    
    let query = PaymentOrder.find(filter)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'customerId', select: 'firstName lastName email' },
          { path: 'countryId', select: 'name flagEmoji' },
          { path: 'visaTypeId', select: 'name fee' }
        ]
      })
    
    // Apply search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query = query.find({
        $or: [
          { razorpayOrderId: searchRegex },
          { razorpayPaymentId: searchRegex },
          { 'applicationId.applicationNumber': searchRegex }
        ]
      })
    }
    
    // Get total count
    const total = await PaymentOrder.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const payments = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing payments:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List all notifications
const listNotifications = async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      isRead, 
      applicationId,
      search, 
      page = 1, 
      limit = 50 
    } = req.query
    
    let filter = {}
    
    // Apply filters
    if (userId) filter.userId = userId
    if (type) filter.type = type
    if (isRead !== undefined) filter.isRead = isRead === 'true'
    if (applicationId) filter.applicationId = applicationId
    
    let query = Notification.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('applicationId', 'applicationNumber')
    
    // Apply search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query = query.find({
        $or: [
          { title: searchRegex },
          { message: searchRegex }
        ]
      })
    }
    
    // Get total count
    const total = await Notification.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const notifications = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing notifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List application status history
const listApplicationStatusHistory = async (req, res) => {
  try {
    const { 
      applicationId, 
      changedBy, 
      oldStatus, 
      newStatus,
      dateFrom,
      dateTo,
      page = 1, 
      limit = 50 
    } = req.query
    
    let filter = {}
    
    // Apply filters
    if (applicationId) filter.applicationId = applicationId
    if (changedBy) filter.changedBy = changedBy
    if (oldStatus) filter.oldStatus = oldStatus
    if (newStatus) filter.newStatus = newStatus
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }
    
    let query = ApplicationStatusHistory.find(filter)
      .populate('applicationId', 'applicationNumber')
      .populate('changedBy', 'firstName lastName')
    
    // Get total count
    const total = await ApplicationStatusHistory.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const history = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing application status history:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List application documents
const listApplicationDocuments = async (req, res) => {
  try {
    const { 
      applicationId, 
      documentType,
      search, 
      page = 1, 
      limit = 50 
    } = req.query
    
    let filter = {}
    
    // Apply filters
    if (applicationId) filter.applicationId = applicationId
    if (documentType) filter.documentType = documentType
    
    let query = ApplicationDocument.find(filter)
      .populate('applicationId', 'applicationNumber')
    
    // Apply search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query = query.find({
        $or: [
          { fileName: searchRegex },
          { documentType: searchRegex }
        ]
      })
    }
    
    // Get total count
    const total = await ApplicationDocument.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const documents = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing application documents:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// List system settings
const listSystemSettings = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query
    
    let query = SystemSettings.find({})
      .populate('updatedBy', 'firstName lastName')
    
    // Apply search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query = query.find({
        $or: [
          { settingKey: searchRegex },
          { description: searchRegex }
        ]
      })
    }
    
    // Get total count
    const total = await SystemSettings.countDocuments(query.getFilter())
    
    // Apply pagination and sorting
    const settings = await query
      .sort({ settingKey: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    res.json({
      data: settings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing system settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { userType, userId } = req.query
    
    let stats = {}
    
    if (userType === 'admin') {
      // Admin dashboard stats
      const [
        totalUsers,
        totalCustomers,
        totalEmployees,
        totalApplications,
        totalCountries,
        totalVisaTypes,
        totalPayments,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalRevenue
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ userType: 'customer' }),
        User.countDocuments({ userType: 'employee', status: 'active' }),
        VisaApplication.countDocuments(),
        Country.countDocuments({ isActive: true }),
        VisaType.countDocuments({ isActive: true }),
        PaymentOrder.countDocuments({ status: 'paid' }),
        VisaApplication.countDocuments({ status: 'under_review' }),
        VisaApplication.countDocuments({ status: 'approved' }),
        VisaApplication.countDocuments({ status: 'rejected' }),
        PaymentOrder.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ])
      
      stats = {
        totalUsers,
        totalCustomers,
        totalEmployees,
        totalApplications,
        totalCountries,
        totalVisaTypes,
        totalPayments,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalRevenue: totalRevenue[0]?.total || 0,
        
        // Recent activity
        recentApplications: await VisaApplication.find()
          .populate('customerId', 'firstName lastName')
          .populate('countryId', 'name')
          .sort({ createdAt: -1 })
          .limit(5),
          
        // Status distribution
        statusDistribution: await VisaApplication.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        // Monthly application trends
        monthlyTrends: await VisaApplication.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ])
      }
    } else if (userType === 'employee') {
      // Employee dashboard stats
      const [
        assignedApplications,
        completedApplications,
        pendingReview,
        approvedToday
      ] = await Promise.all([
        VisaApplication.countDocuments({ assignedTo: userId }),
        VisaApplication.countDocuments({ 
          assignedTo: userId, 
          status: { $in: ['approved', 'rejected'] } 
        }),
        VisaApplication.countDocuments({ 
          assignedTo: userId, 
          status: 'under_review' 
        }),
        VisaApplication.countDocuments({
          assignedTo: userId,
          status: 'approved',
          approvedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ])
      
      stats = {
        assignedApplications,
        completedApplications,
        pendingReview,
        approvedToday,
        
        // Recent assigned applications
        recentAssigned: await VisaApplication.find({ assignedTo: userId })
          .populate('customerId', 'firstName lastName')
          .populate('countryId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
      }
    } else if (userType === 'customer') {
      // Customer dashboard stats
      const [
        totalApplications,
        draftApplications,
        underReview,
        approvedApplications,
        rejectedApplications
      ] = await Promise.all([
        VisaApplication.countDocuments({ customerId: userId }),
        VisaApplication.countDocuments({ customerId: userId, status: 'draft' }),
        VisaApplication.countDocuments({ customerId: userId, status: 'under_review' }),
        VisaApplication.countDocuments({ customerId: userId, status: 'approved' }),
        VisaApplication.countDocuments({ customerId: userId, status: 'rejected' })
      ])
      
      stats = {
        totalApplications,
        draftApplications,
        underReview,
        approvedApplications,
        rejectedApplications,
        
        // Recent applications
        recentApplications: await VisaApplication.find({ customerId: userId })
          .populate('countryId', 'name')
          .populate('visaTypeId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
      }
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Export all functions
export {
  listUsers,
  listCountries,
  listVisaTypes,
  listApplications,
  listPayments,
  listNotifications,
  listApplicationStatusHistory,
  listApplicationDocuments,
  listSystemSettings,
  getDashboardStats
}