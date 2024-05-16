export const userRoles = ["super_admin", "admin", "student"];
export const adminPermissions = [
  "user",
  "course",
  "subscription",
  "course_video",
  "exam",
  "book",
  "order_status",
  "order",
  "subject",
] as const;

export const userFilterableFields = [
  "searchTerm",
  "name",
  "email",
  "contact_no",
  "role",
];

export const userSearchableFields = ["name", "email", "contact_no"];
