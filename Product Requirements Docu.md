# Product Requirements Document (PRD): Campus Events Web App

## 1. Document Information

| Field | Details |
|---|---|
| Product name | Campus Events Web App |
| PRD owner | [Product owner name] |
| Contributors | [Product, engineering, design, QA, administrator representatives] |
| Status | Draft |
| Version | v1.0 |
| Last updated | October 10, 2026 |
| Target release | [Release date] |
| Related documents | [Design files, technical specification, test plan] |

## 2. Executive Summary

The Campus Events Web App is a network-connected web application that provides one central place for students, event organizers, and administrators to share and manage campus events.

Students can discover upcoming activities, view event details, register online, receive QR tickets, and read announcements. Organizers can submit events, manage registrations, publish updates, scan attendee QR tickets, and review attendance. Administrators can review event submissions, manage users and roles, oversee events, and view platform-wide reports.

The application replaces fragmented event information across posters, social media, group chats, and separate registration forms with a shared, database-backed system.

## 3. Background and Context

Campus event details are often spread across multiple channels, including posters, social-media posts, group chats, and separate registration forms. This makes it difficult for students to find accurate event information and difficult for organizers to track registrations and attendance.

The Campus Events Web App brings event discovery, registration, announcements, and attendance tracking into one system. It is designed to make campus events easier to find and simpler to coordinate.

## 4. Problem Statement

Students currently cannot easily find reliable, centralized information about campus events because event details are distributed across posters, social media, group chats, and separate registration forms.

Organizers also lack a single tool for managing event submissions, participant lists, announcements, and attendance. This creates manual work, inconsistent information, and difficulty tracking who registered or attended.

## 5. Project Goal

Design and build a network-connected web application that supports the campus event process from event submission and approval through student registration and attendance tracking.

The project should demonstrate:

- Web application development
- Shared database access
- User permissions and role-based access
- Communication between client devices and a central server

## 6. Target Users and Roles

| Role | Description | Primary needs |
|---|---|---|
| Student | A campus member looking for and attending events | Discover events, view details, register, access QR tickets, receive updates |
| Event organizer | A student, staff member, or group that runs an event | Submit events, edit details, manage registrations, publish updates, scan tickets, view attendance |
| Administrator | A platform overseer | Review submissions, approve or reject events, manage users and roles, oversee events and reports |

## 7. Goals and Non-Goals

### Goals

- Provide students with one central place to find event information.
- Enable students to register for events online.
- Allow organizers to submit, manage, and update events.
- Enable administrators to review and approve event submissions.
- Track registrations and enforce event capacity limits.
- Provide QR-based event check-in where enabled.
- Maintain consistent event, registration, and attendance data across connected devices.
- Provide basic reporting for organizers and administrators.

### Non-Goals / Out of Scope for Version 1

The following features are possible later additions and are not required for the first version:

- Email reminders
- Event feedback forms
- Calendar exports
- Waitlists
- Event recommendations
- Mobile-friendly progressive web app
- Advanced analytics beyond basic registration and attendance reports

## 8. Success Metrics

| Metric | Definition | Target |
|---|---|---|
| Event discovery | Students can find approved events in one place | Event listing displays approved events with relevant details |
| Registration success | Students can register for open events | Registration completes successfully when capacity remains |
| Capacity enforcement | The system prevents registrations beyond event capacity | No overbooking occurs |
| Check-in accuracy | QR check-in records valid attendees correctly | Valid tickets check in once; invalid or duplicate tickets are rejected |
| Organizer efficiency | Organizers can view registrations and attendance | Organizer dashboard displays participant and attendance information |
| Data consistency | All connected users see current event and registration data | Central database is the source of truth |

## 9. User Scenarios

### Scenario 1: Student discovers and registers for an event

1. A student signs in to the web app.
2. The student browses upcoming and approved events.
3. The student filters events by date, category, or organizer.
4. The student opens an event page and reviews the description, schedule, location, and capacity.
5. The student registers for the event.
6. The system saves the registration, checks remaining capacity, and displays a confirmation.
7. If QR check-in is enabled, the student receives a unique QR ticket.

### Scenario 2: Organizer submits an event

1. An organizer signs in and submits an event.
2. The organizer enters the title, description, date, time, venue, category, registration deadline, and capacity.
3. The event is sent to an administrator for review.
4. Once approved, the event becomes visible to students.

### Scenario 3: Organizer checks in attendees

1. At the venue, the organizer opens the QR scanner.
2. A student presents their QR ticket.
3. The system validates the registration.
4. If valid and unused, the system marks the attendee as present and records the check-in time.
5. If the ticket is invalid or already used, the system displays the appropriate result.

## 10. Functional Requirements

### Student Features

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Students can browse upcoming and approved events. | P0 |
| FR-02 | Students can search or filter events by date, category, or organizer. | P0 |
| FR-03 | Students can view event descriptions, schedules, locations, and capacity. | P0 |
| FR-04 | Students can register for events online. | P0 |
| FR-05 | Students can review their event registrations. | P0 |
| FR-06 | Students can view a unique QR ticket when QR check-in is enabled. | P1 |
| FR-07 | Students can read event announcements and updates. | P1 |

### Organizer Features

| ID | Requirement | Priority |
|---|---|---|
| FR-08 | Organizers can submit events for approval. | P0 |
| FR-09 | Organizers can edit event details, including title, time, location, and participant limit. | P0 |
| FR-10 | Organizers can view registrations and participant lists. | P0 |
| FR-11 | Organizers can publish updates to registered participants. | P1 |
| FR-12 | Organizers can scan attendee QR tickets and review attendance. | P1 |
| FR-13 | Organizers can view basic event reports. | P1 |

### Administrator Features

| ID | Requirement | Priority |
|---|---|---|
| FR-14 | Administrators can review event submissions. | P0 |
| FR-15 | Administrators can approve, reject, or return events for edits. | P0 |
| FR-16 | Administrators can manage user accounts and roles. | P0 |
| FR-17 | Administrators can oversee events, registrations, and announcements. | P1 |
| FR-18 | Administrators can view reports across the platform. | P1 |

### Registration and Capacity Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-19 | The system must check whether spaces remain before confirming a registration. | P0 |
| FR-20 | The system must prevent registrations once an event reaches capacity. | P0 |
| FR-21 | The system may support an optional waitlist for full events. | P2 |

## 11. QR Code Check-In Requirements

A QR code serves as a digital ticket for a student’s event registration.

| ID | Requirement | Priority |
|---|---|---|
| QR-01 | Each QR ticket must identify a registration through a unique ID or secure token. | P1 |
| QR-02 | The QR code must not expose unnecessary personal information directly. | P1 |
| QR-03 | When scanned, the system must verify that the registration is valid. | P1 |
| QR-04 | The system must prevent a registration from being checked in more than once. | P1 |
| QR-05 | The system must display a clear scan result, such as “Checked in successfully,” “Not registered,” or “Already checked in.” | P1 |
| QR-06 | The database must record attendance status and check-in time. | P1 |
| QR-07 | Scanning may use a phone or tablet camera through a browser-supported QR scanner. | P1 |
| QR-08 | The system may include manual attendee lookup as a fallback. | P2 |

## 12. User Experience Requirements

The application should provide:

- Event listings and event detail pages
- Login and role-based access for students, organizers, and administrators
- Clear event submission and administrator approval workflows
- Online registration with participant limits
- Optional waitlist handling for full events
- QR ticket creation and attendance check-in
- Announcements and event updates
- Organizer dashboards and basic attendance reports

## 13. System Architecture

The app will use a client-server architecture.

- Students, organizers, and administrators access the application through web browsers.
- Devices connect through campus Wi-Fi or the Internet.
- Browser requests are sent to a central web application server.
- The server applies permissions, processes requests, and reads or writes data in a central database.
- The server returns results to the user’s device.

### Data Flow

1. A user signs in from a browser.
2. The browser sends a request over the network to the application server.
3. The server checks the user’s permissions and processes the request.
4. The server retrieves or updates the appropriate database records.
5. The server returns the result to the user’s device.

This architecture allows multiple users to work with the same up-to-date event information. For a school demonstration, the server and database may run on one computer while other devices connect over the same local network. The app may also be hosted online for Internet access.

## 14. Data Requirements

The prototype should include the following core data entities:

| Entity | Key data |
|---|---|
| Users | Account details and user role |
| Events | Event details, organizer, schedule, capacity, and approval status |
| Registrations | Student, event, registration time, and registration status |
| Check-ins | Registration, check-in time, and staff member who scanned the ticket |
| Announcements | Event, message, author, and publication time |

## 15. Assumptions

- Users have access to a browser and campus Wi-Fi or the Internet.
- Organizers and administrators have appropriate accounts and permissions.
- Event organizers can provide accurate event details, including capacity and registration deadlines.
- QR scanning can be performed using a browser-supported camera scanner.
- For a demonstration, the server and database can run on a single computer connected to a local network.

## 16. Dependencies

| Dependency | Owner | Purpose |
|---|---|---|
| Web application server | Engineering team | Hosts the application and processes requests |
| Central database | Engineering team | Stores users, events, registrations, check-ins, and announcements |
| Authentication system | Engineering team | Supports login and role-based access |
| QR generation and scanning capability | Engineering team | Creates student QR tickets and supports organizer scanning |
| Campus network or Internet access | IT / demonstration environment | Enables client-server communication |

## 17. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| QR scanning may not work reliably on all devices | Check-in delays or failures | Provide manual attendee lookup as a fallback |
| Concurrent registrations could exceed capacity | Overbooking | Enforce capacity checks on the server before confirming registration |
| Users may submit incomplete or inaccurate event details | Poor event information quality | Require key fields and use administrator review |
| Role permissions may be implemented incorrectly | Unauthorized access or actions | Use role-based access control and test each role |
| Network connectivity may be unavailable during an event | Check-in disruption | Use local network deployment for demonstrations and provide manual fallback |

## 18. Release Scope

### Version 1 Must Include

1. User login and roles.
2. Event creation and administrator approval.
3. Event browsing and student registration.
4. Registration capacity checks.
5. QR ticket and check-in, if time and tools allow.
6. A simple organizer report showing registrations and checked-in attendees.

### Future Enhancements

- Email reminders
- Feedback forms
- Calendar exports
- Waitlists
- Event recommendations
- Mobile-friendly progressive web app

## 19. Open Questions

| Question | Owner | Status | Decision |
|---|---|---|---|
| Which authentication method will be used? | Engineering | Open | [Pending] |
| Will QR check-in be included in the first release? | Product / Engineering | Open | [Pending] |
| Which event categories will be supported initially? | Product | Open | [Pending] |
| What reporting metrics are required for administrators? | Product / Administrators | Open | [Pending] |
| Will the application be hosted locally or online for the demonstration? | Engineering / IT | Open | [Pending] |

## 20. Approvals

| Role | Name | Approval status | Date |
|---|---|---|---|
| Product manager | [Name] | Pending | [Date] |
| Engineering lead | [Name] | Pending | [Date] |
| Design lead | [Name] | Pending | [Date] |
| QA lead | [Name] | Pending | [Date] |
| Administrator representative | [Name] | Pending | [Date] |

## 21. Change Log

| Date | Version | Author | Change |
|---|---|---|---|
| October 10, 2026 | v1.0 | [Author] | Initial PRD created from the Campus Events Web App project overview |
