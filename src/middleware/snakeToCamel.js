// src/utils/snakeToCamel.js

/**
 * Converts a snake_case string to camelCase
 * e.g. contact_email → contactEmail
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts all keys of an object from snake_case to camelCase
 * e.g. { contact_email: 'a', organization_type_id: 1 }
 *   → { contactEmail: 'a', organizationTypeId: 1 }
 * Works recursively on nested objects and arrays
 */
function snakeToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        snakeToCamel(value)
      ])
    );
  }
  return obj;
}

module.exports = snakeToCamel;