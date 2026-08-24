// AUDIT HOOK & HELPER
// In pb_hooks VM, top-level functions are not shared across callbacks or files,
// but we register audit logger on custom events or keep this hook active for audit tracking.

onRecordCreateRequest((e) => {
  // Prevent direct client creation of audit_logs - superusers or hooks only
  const authUser = e.auth
  if (authUser && !e.hasSuperuserAuth()) {
    throw new ForbiddenError('Registros de auditoria são gerados exclusivamente pelo sistema.')
  }
  e.next()
}, 'audit_logs')

onRecordUpdateRequest((e) => {
  // Audit logs are strictly immutable
  throw new ForbiddenError('Registros de auditoria são estritamente imutáveis.')
}, 'audit_logs')

onRecordDeleteRequest((e) => {
  // Audit logs cannot be deleted by users
  if (!e.hasSuperuserAuth()) {
    throw new ForbiddenError('Registros de auditoria não podem ser excluídos.')
  }
  e.next()
}, 'audit_logs')
