// crypto.randomUUID() only exists on secure origins, and this app is also opened over plain-http LAN
// addresses while developing, so ids are built by hand.
export const newId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
