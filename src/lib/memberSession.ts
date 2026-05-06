export interface MemberSession {
  id: string;
  name: string;
  mobile: string;
}

const KEY = "member_session";

export function getMemberSession(): MemberSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setMemberSession(s: MemberSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearMemberSession() {
  localStorage.removeItem(KEY);
}
