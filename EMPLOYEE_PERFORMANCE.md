# Employee Performance Dashboard

The Employee Performance Dashboard provides comprehensive analytics and insights for visa processing employees to track their productivity, efficiency, and work quality.

## Features

### 📊 Key Metrics
- **Total Processed**: Number of applications reviewed and decided upon
- **Approved Count**: Applications approved by the employee
- **Rejected Count**: Applications rejected by the employee
- **Current Assignments**: Active applications assigned to the employee
- **Recent Activity**: Applications processed in the last 30 days
- **Approval Rate**: Percentage of approved applications
- **Average Processing Time**: Time taken to process applications (in days)

### 🎯 Performance Insights
- **Approval Performance**: Feedback based on approval rate
- **Processing Speed**: Efficiency analysis and recommendations
- **Workload Balance**: Current workload assessment and suggestions

### 👤 Employee Information
- Role and position within the organization
- Employee ID for identification
- Hire date and tenure information

### 📈 Additional Metrics
- **Total Assigned**: All applications ever assigned to the employee
- **Pending Review**: Applications currently under review
- **Completed Today**: Applications processed today
- **Recent Activity**: Work done in the last 30 days

## API Endpoints

### Get Employee Performance
```
GET /api/employee/performance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalProcessed": 25,
  "approvedCount": 20,
  "rejectedCount": 5,
  "currentAssignments": 8,
  "recentProcessed": 12,
  "approvalRate": 80,
  "avgProcessingTime": 3,
  "role": "Senior Processor",
  "employeeId": "EMP001",
  "hireDate": "2023-06-15T00:00:00.000Z",
  "totalAssigned": 33,
  "pendingReview": 8,
  "completedToday": 2
}
```

## Database Schema

The performance data is calculated from:

### Applications Collection
- `assignedTo`: Employee ID
- `status`: Application status (approved, rejected, under_review, etc.)
- `submittedAt`: When application was submitted
- `reviewedAt`: When application was reviewed
- `approvedAt`: When application was approved

### Application Status History Collection
- `changedBy`: Employee who made the status change
- `newStatus`: New status applied
- `oldStatus`: Previous status
- `createdAt`: When the change was made

### Employee Profile Collection
- `role`: Employee role (Senior Processor, Processor, Junior Processor)
- `employeeId`: Unique employee identifier
- `hireDate`: When employee was hired

## Performance Calculations

### Approval Rate
```javascript
const approvalRate = totalDecisions > 0 ? 
  Math.round((approvedCount / totalDecisions) * 100) : 0
```

### Average Processing Time
```javascript
const avgProcessingTime = completedApplications.length > 0 ? 
  Math.round(totalProcessingTime / completedApplications.length) : 0
```

### Recent Activity (30 days)
```javascript
const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
const recentProcessed = processedApplications.filter(history => 
  history.createdAt >= thirtyDaysAgo
).length
```

## Usage

### For Employees
1. Navigate to `/employee-performance` from the employee dashboard
2. View your personal performance metrics
3. Use insights to improve productivity and quality

### For Administrators
- Access employee performance data through admin dashboard
- Monitor team productivity and identify training needs
- Make data-driven decisions for workload distribution

## Testing

Run the performance test script:
```bash
npm run test-performance
```

This will:
1. Login as a test employee
2. Fetch performance data
3. Display metrics in the console
4. Test with multiple employees

## Performance Insights Logic

### Approval Performance
- **Excellent (≥80%)**: "Your approval rate is excellent. Keep up the quality work!"
- **Good (≥60%)**: "Good approval rate. Consider reviewing rejection patterns."
- **Needs Improvement (<60%)**: "Focus on understanding application requirements better."
- **No Data**: "No decisions made yet. Start processing applications to see your performance."

### Processing Speed
- **Excellent (≤3 days)**: "Excellent processing speed! You're very efficient."
- **Good (≤7 days)**: "Good processing time. Consider streamlining your workflow."
- **Needs Improvement (>7 days)**: "Try to reduce processing time while maintaining quality."
- **No Data**: "No completed applications yet to calculate processing time."

### Workload Balance
- **No Load (0)**: "No current assignments. Ready to take on new applications."
- **Light (≤5)**: "Light workload. Ready to take on more applications."
- **Balanced (≤15)**: "Balanced workload. Managing well."
- **Heavy (>15)**: "Heavy workload. Consider prioritizing urgent applications."

## Security

- Only employees can access their own performance data
- Admin users can access all employee performance data
- JWT authentication required for all endpoints
- Role-based access control implemented

## Future Enhancements

- [ ] Performance comparison with team averages
- [ ] Historical performance trends and charts
- [ ] Goal setting and achievement tracking
- [ ] Performance-based notifications and alerts
- [ ] Export performance reports to PDF/Excel
- [ ] Team performance rankings and leaderboards