/** Single source of truth for the 4 colleges (sign-up dropdown, filter pills, event data). */
export const DEPARTMENTS = [
  { value: "eng", label: "College of Engineering", short: "Engineering", code: "COE" },
  { value: "sci", label: "College of Art and Science", short: "Arts & Science", code: "CAS" },
  { value: "biz", label: "College of Business Administration", short: "Business Administration", code: "CBA" },
  { value: "art", label: "College of Fine Arts, Architecture and Design", short: "Fine Arts, Architecture, and Design", code: "CFAD" },
] as const;

export type DepartmentId = (typeof DEPARTMENTS)[number]["value"];

export function isDepartmentId(value: unknown): value is DepartmentId {
  return DEPARTMENTS.some((d) => d.value === value);
}

export function getDepartment(id: DepartmentId) {
  return DEPARTMENTS.find((d) => d.value === id)!;
}
