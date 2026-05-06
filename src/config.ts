export const ADMIN_EMAILS = [
  'muhamadhaikalrasyaputra@gmail.com',
  'kusnadi@gmail.com'
];

export const isAdmin = (email: string | undefined) => {
  if (!email) return false;
  return ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
};
