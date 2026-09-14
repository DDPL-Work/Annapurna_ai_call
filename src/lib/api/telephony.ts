// Telephony webhooks are server-to-server (Exotel → Django).
// The frontend does NOT call these endpoints directly.
// They are documented here for reference only.

export const TELEPHONY_WEBHOOKS = {
  incomingCall: "/api/v1/telephony/webhooks/incoming-call/",
  callStatus: "/api/v1/telephony/webhooks/call-status/",
} as const;
