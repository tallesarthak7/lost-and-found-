/**
 * Validates whether an ID is a valid Supabase UUID, MongoDB ObjectId, or general ID string.
 * @param {any} value
 * @returns {boolean}
 */
function isValidId(value) {
  if (!value) return false;
  const str = String(value).trim();
  if (!str) return false;

  // UUID v4 / PostgreSQL gen_random_uuid() pattern
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (uuidRegex.test(str)) return true;

  // Legacy 24-hex MongoDB ObjectId pattern
  const mongoRegex = /^[0-9a-fA-F]{24}$/;
  if (mongoRegex.test(str)) return true;

  // General non-empty valid identifier
  return str.length >= 6 && /^[a-zA-Z0-9_-]+$/.test(str);
}

module.exports = isValidId;
