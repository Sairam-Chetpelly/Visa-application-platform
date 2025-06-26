// This is a temporary file to fix the phone input
// Replace the phone input section with this code:

<div className="space-y-2">
  <Label htmlFor="empPhone">Phone Number</Label>
  <PhoneInput
    id="empPhone"
    value={newEmployee.phone}
    onChange={(value) => setNewEmployee({ ...newEmployee, phone: value })}
    placeholder="Phone number"
    required
  />
</div>