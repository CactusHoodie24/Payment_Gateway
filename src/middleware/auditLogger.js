// src/middleware/auditLogger.js
const auditService = require('../services/auditService');
const { HTTPMethodToAction, URLPathToResourceType } = require('../enums/AuditActivityEnum');

// Extract resource type from the request path
// e.g. /api/organizations/123 → 'organization'
function getResourceType(path) {
  const segments = path.replace(/^\/api\//, '').split('/');
  const pathSegment = segments[0] || 'unknown';
  
  // Check if the path segment exists in our enum mapping
  if (URLPathToResourceType[pathSegment]) {
    return URLPathToResourceType[pathSegment];
  }
  
  // Fallback to converting the path segment to lowercase with underscores
  return pathSegment.toLowerCase().replace(/s$/, '');
}

// Extract resource ID from params or response
function getResourceId(req, resBody) {
  // From route params (e.g. /:id)
  if (req.params.id) return String(req.params.id);
  // From created resource in response body
  if (resBody?.data?.id) return String(resBody.data.id);
  if (resBody?.data?.organization?.id) return String(resBody.data.organization.id);
  return null;
}

// Build a human-readable description
function buildDescription(action, resourceType, resourceId, userName) {
  const actionVerb = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    APPROVE: 'approved',
    REJECT: 'rejected',
  };
  const verb = actionVerb[action] || action.toLowerCase();
  const target = resourceId ? `${resourceType} #${resourceId}` : resourceType;
  return `${userName || 'Unknown user'} ${verb} ${target}`;
}

// Get client IP address
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.ip;
}

/**
 * Middleware that automatically logs audit events for mutating requests.
 * Must be placed AFTER auth middleware so req.user is available.
 *
 * Usage in routes:
 *   router.post('/', authMiddleware(['admin']), auditLogger, controller.create);
 *
 * Or as a blanket middleware on specific route groups:
 *   router.use(auditLogger);
 */
function auditLogger(req, res, next) {
  const method = req.method.toUpperCase();

  // Only audit mutating requests
  if (!HTTPMethodToAction[method]) {
    return next();
  }

  // Capture the original json method to intercept the response
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    // Only log successful mutations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const action = HTTPMethodToAction[method];
      const resourceType = getResourceType(req.originalUrl || req.url);
      const resourceId = getResourceId(req, body);
      const userName = req.user?.email || req.user?.name || null;
      const userId = req.user?.id;

      if (userId) {
        // Fire-and-forget — don't block the response
        auditService.log({
          userId,
          userName,
          action,
          resourceType,
          resourceId,
          description: buildDescription(action, resourceType, resourceId, userName),
          previousValue: null, // Generic middleware doesn't have old values
          newValue: method === 'DELETE' ? null : (req.body || null),
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || null
        });
      }
    }

    return originalJson(body);
  };

  next();
}

/**
 * Helper for manual audit logging in controllers where you need
 * to capture previous values or use a custom action/description.
 *
 * Usage in a controller:
 *   const { logAudit } = require('../middleware/auditLogger');
 *   const oldOrg = await organizationService.getOrganizationById(id);
 *   const updated = await organizationService.updateOrganization(id, data);
 *   logAudit(req, { action: 'UPDATE', resourceType: 'organization', resourceId: id, previousValue: oldOrg, newValue: updated });
 */
function logAudit(req, { action, resourceType, resourceId, description, previousValue, newValue }) {
  const userId = req.user?.id;
  const userName = req.user?.email || req.user?.name || null;

  if (!userId) return;

  auditService.log({
    userId,
    userName,
    action,
    resourceType,
    resourceId: resourceId ? String(resourceId) : null,
    description: description || buildDescription(action, resourceType, resourceId, userName),
    previousValue: previousValue || null,
    newValue: newValue || null,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null
  });
}

module.exports = auditLogger;
module.exports.logAudit = logAudit;
