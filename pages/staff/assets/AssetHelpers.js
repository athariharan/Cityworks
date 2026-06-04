// pages/staff/assets/AssetHelpers.js
// Shared utilities used by AssetOverviewPage, AssetDetailsPage, and AssetListPage.
export { unwrap } from "../../../utility/ApiHelpers";
/**
 * Validates the asset registration form.
 * Returns an object of field -> error message (empty object = valid).
 */
export function validate(form) {
  const errors = {};
  if (!form.assetTag)
    errors.assetTag = "Asset tag is required";
  else if (!/^[a-zA-Z0-9-]{3,50}$/.test(form.assetTag))
    errors.assetTag = "3–50 chars, alphanumeric + hyphens";
  if (!form.type)        errors.type        = "Asset type is required";
  if (!form.status)      errors.status      = "Asset status is required";
  if (!form.installDate) errors.installDate = "Install date is required";
  return errors;
}
