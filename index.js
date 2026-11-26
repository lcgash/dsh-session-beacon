/**
 * Host half of dsh-session-beacon.
 *
 * Deliberately empty: the plugin is a browser-side decoration that reads the
 * existing Session list and Session status sources through slot props. It
 * registers no Host service, tool, listener, or persistence, so activating
 * it cannot change agent behavior or the session log.
 */
export function apply() {}
