# Group Project Discussion

**Course:** SWE4040A Software Construction and Development — USIU-Africa, 2026 Fall
**Group size:** 2 members (max, per assignment instructions)
**Project:** Peer Tutoring & Study Group Matcher

> This document answers the 10 discussion questions from the "Group Project" discussion topic, based on our chosen project.

---

## 1. What problem are we solving?

Students who are struggling in a course often don't know who on campus could help them, and students who are strong in a course have no easy way to offer help. Peer tutoring today happens informally — a friend-of-a-friend recommendation, a note on a noticeboard, or a scattered WhatsApp group per course — which means:

- Students needing help can't easily find someone qualified in a specific course.
- Willing peer tutors have no visibility or organized way to be found.
- There's no shared calendar, so arranging a time that works for both people is manual and slow.
- There's no record of past sessions, so quality/reliability of a tutor is unknown to a new student.

## 2. What should the system do?

The system should let users:

- **Register as a tutor** for one or more courses, listing availability and (optionally) qualifications (e.g., grade earned, faculty recommendation).
- **Request help** for a specific course, listing the topic and preferred times.
- **Get matched** with a suitable tutor/study partner based on course, topic, and overlapping availability.
- **Schedule a session** (1-on-1 or a small study group) directly through the matched availability, with automatic conflict checking.
- **Track session history** — completed sessions, no-shows, and ratings/feedback after each session.
- Give an **admin/coordinator view** to verify tutor eligibility, monitor overall usage, and moderate reported issues (e.g., a no-show or inappropriate conduct).

## 3. Who will use it?

| User role | What they do in the system |
|---|---|
| **Tutees (students needing help)** | Request help for a course, browse/match with tutors, book sessions, leave feedback |
| **Tutors (peer students)** | Register availability and courses they can help with, accept/schedule sessions |
| **Course coordinator / department admin** | Verify tutor eligibility, view usage reports, moderate disputes |
| **System administrator** | Manage accounts, course list, and system configuration |

## 4. How will requirements be collected?

- **Interviews** with a few students who have both sought and given informal peer help, to understand what currently works and what's frustrating.
- **A short survey** to gauge demand: which courses students most want tutoring in, and how many students would be willing to tutor.
- **Consultation with a course coordinator or TA office**, since they may already track informal tutoring arrangements and can advise on eligibility rules (e.g., minimum grade to tutor a course).
- **Benchmarking** against similar peer-matching or scheduling apps for structure ideas.
- **Use case workshops** between the two group members, using the lecturer/TA as a stakeholder proxy for feedback, consistent with the requirements-engineering and case-study approach emphasized in the course.
- Requirements will be written up as a short **Software Requirements Specification (SRS)** with a traceability list (requirement → use case → test case) so nothing collected is lost before design.

## 5. How will the system be designed?

- **Architecture:** a 3-tier web application — presentation (UI), application/business logic (matching engine and scheduler), and a database layer.
- **Diagrams:** use case diagram (actors above), class diagram, sequence diagram for the match-and-book flow, and an ER diagram for the database (Users, Courses, TutorProfiles, HelpRequests, Sessions, Feedback).
- **Design principles:** modularity and separation of concerns (per Sommerville/Pressman, the course's reference texts), keeping the **matching algorithm** decoupled from the UI so it can be improved later (e.g., weighting by rating history, not just availability).
- **Approach:** an agile/XP-influenced design — start with the simplest matching rule that satisfies current requirements (course + overlapping availability), and refactor as the two members learn more, matching the course's "Putting XP into practice" topic.
- **Stack decision** (to be finalized by the team): a web frontend, a lightweight backend API, and a relational database — chosen for familiarity and fast setup within the semester timeline.

## 6. Who will write the code?

Both group members write code, split by ownership so work can proceed in parallel:

- **Member A:** backend/API, database schema, matching algorithm, scheduling/conflict logic.
- **Member B:** frontend UI, authentication, tutor/tutee profile and booking screens.

Shared/critical logic (e.g., the matching-and-booking flow) will be built together (pair-programming style), consistent with the XP practices covered in the course. All code lives in this shared Git repository, with feature branches and pull requests reviewed by the other member before merging.

## 7. How will we test it?

- **Unit tests** for core logic — the matching algorithm and availability/conflict checking.
- **Integration tests** for API endpoints (register tutor, request help, book session, submit feedback).
- **Manual UI testing** of the main user flows: register as tutor → request help → get matched → book session → leave feedback.
- **User acceptance testing (UAT)** with a small group of real students before final submission.
- Test cases will be derived directly from the requirements/use cases collected in step 4, so every requirement has at least one corresponding test.
- A **regression pass** will be run before each milestone (CAT2, project draft in Week 12, final submission in Week 13).

## 8. How will we know that the software is complete?

The project will be considered complete ("Definition of Done") when:

- Every functional requirement in the SRS is implemented and traceable to a test case.
- All core workflows work end-to-end: tutor registration, help request, matching, scheduling, and post-session feedback.
- No open critical or high-severity bugs remain.
- Documentation is in place: README, setup instructions, and basic user guide.
- The deliverable meets the course's Week 13 requirement to "submit final complete group project."

## 9. How will changes be controlled?

- All change requests (new features, scope adjustments) are logged as issues in the repository, with a short description and priority.
- Because the group has only two members, both must agree before a change is implemented — acting as a lightweight two-person change control board.
- A simple backlog/board (e.g., a GitHub Projects board or shared checklist) is used to track what's planned, in progress, and done, to avoid scope creep given the limited project weeks (11–13) on the course schedule.
- Git commit history and pull requests serve as the audit trail for what changed, when, and why.

## 10. How will the software be maintained?

- Documentation (README, architecture notes, setup steps) is kept up to date in the repository so anyone taking over later can understand the system quickly.
- Bugs and enhancement ideas discovered after submission are tracked as GitHub issues rather than lost in conversation.
- The modular design (separating the matching engine from the UI) is intended to make future improvements — such as rating-weighted matching or group-study support — easier to add without a rewrite.
- The database (tutor profiles, session history, feedback) should be backed up periodically, since it holds a reputation record that's useful beyond a single semester.
- If the system is to be used beyond the course, a handover plan would be needed — e.g., to a department's TA office or a student peer-learning club — with documented admin instructions.
