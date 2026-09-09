const ADMIN_EMAIL = "ryan.replogle@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return email === ADMIN_EMAIL;
}
