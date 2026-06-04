// pages/staff/inspections/InspectionHelpers.js
// Validation helper for the inspection record form.

// Checks required fields and returns an object of error messages.
// An empty object means the form is valid and can be submitted.
export function validateInspection(form) {
  const errors = {};
  if (!form.assetId)         errors.assetId         = "Please select an asset";
  if (!form.conditionRating) errors.conditionRating  = "Condition rating is required";
  if (!form.status)          errors.status           = "Status is required";
  return errors;
}
