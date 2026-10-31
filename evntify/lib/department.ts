/** Single source of truth for colleges/departments (sign-up dropdown, filter pills, event data). */
export const DEPARTMENTS = [
    { value: "eng", label: "College of Engineering", short: "Engineering" },
    { value: "cs", label: "Lucio Tan College of Computer Studies", short: "Computer Studies" },
    { value: "biz", label: "Tan Yan Kee Business & Accountancy", short: "Business" },
    { value: "arts", label: "College of Arts and Sciences", short: "Arts & Sciences" },
    { value: "med", label: "Institute of Health Sciences & Medicine", short: "Health Sciences" },
    { value: "law", label: "College of Law & Public Administration", short: "Law" },
] as const;

export type DepartmentId = (typeof DEPARTMENTS)[number]["value"];

export function isDepartmentId(value: unknown): value is DepartmentId {
    return DEPARTMENTS.some((d) => d.value === value);
}

export function getDepartment(id: DepartmentId) {
    return DEPARTMENTS.find((d) => d.value === id)!;
}