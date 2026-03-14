// src/utils/camelToSnake.js

/**
 * Converts a camelCase string to snake_case
 * e.g. contactEmail → contact_email
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts all keys of an object from camelCase to snake_case
 * e.g. { contactEmail: 'a', organizationTypeId: 1 }
 *   → { contact_email: 'a', organization_type_id: 1 }
 */
function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toSnakeCase(key), value])
  );
}

module.exports = camelToSnake;