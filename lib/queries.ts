// Read-side "views": join the flat JSON collections into the shapes pages
// actually render. Kept separate from db.ts so mutations (in app/actions/*)
// and reads (in page.tsx Server Components) don't tangle.

import 'server-only';
import { db, type Course, type TutorProfile, type HelpRequest, type TutoringSession, type Feedback } from './db';

export function listCourses(): Course[] {
  return db.courses;
}

export interface TutorProfileView extends TutorProfile {
  tutorName: string;
  courseCode: string | null;
  courseName: string | null;
  avgRating: number | null;
  ratingCount: number;
}

export function getTutorProfileView(profile: TutorProfile): TutorProfileView {
  const user = db.users.find((u) => u.id === profile.userId);
  const course = db.courses.find((c) => c.id === profile.courseId);
  const ratings = db.feedback.filter((f) => {
    const session = db.sessions.find((s) => s.id === f.sessionId);
    return session && session.tutorId === profile.userId && session.courseId === profile.courseId;
  });
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length) * 10) / 10
    : null;

  return {
    ...profile,
    tutorName: user ? user.name : 'Unknown',
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    avgRating,
    ratingCount: ratings.length,
  };
}

export function listTutorsForCourse(courseId: number): TutorProfileView[] {
  return db.tutorProfiles.filter((p) => p.courseId === courseId).map(getTutorProfileView);
}

export function listMyTutorProfiles(userId: number): TutorProfileView[] {
  return db.tutorProfiles.filter((p) => p.userId === userId).map(getTutorProfileView);
}

export interface HelpRequestView extends HelpRequest {
  courseCode: string | null;
  courseName: string | null;
  tuteeName: string;
}

export function getHelpRequestView(request: HelpRequest): HelpRequestView {
  const course = db.courses.find((c) => c.id === request.courseId);
  const tutee = db.users.find((u) => u.id === request.tuteeId);
  return {
    ...request,
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    tuteeName: tutee ? tutee.name : 'Unknown',
  };
}

export function listMyHelpRequests(userId: number): HelpRequestView[] {
  return db.helpRequests.filter((r) => r.tuteeId === userId).map(getHelpRequestView);
}

export interface SessionView extends TutoringSession {
  tutorName: string;
  tuteeName: string;
  courseCode: string | null;
  courseName: string | null;
  feedback: Feedback | null;
}

export function getSessionView(session: TutoringSession): SessionView {
  const tutor = db.users.find((u) => u.id === session.tutorId);
  const tutee = db.users.find((u) => u.id === session.tuteeId);
  const course = db.courses.find((c) => c.id === session.courseId);
  const feedback = db.feedback.find((f) => f.sessionId === session.id) ?? null;
  return {
    ...session,
    tutorName: tutor ? tutor.name : 'Unknown',
    tuteeName: tutee ? tutee.name : 'Unknown',
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    feedback,
  };
}

export function listMySessions(userId: number): SessionView[] {
  return db.sessions
    .filter((s) => s.tutorId === userId || s.tuteeId === userId)
    .map(getSessionView)
    .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
}

export interface AdminTutorView extends TutorProfile {
  tutorName: string;
  tutorEmail: string | null;
  courseCode: string | null;
}

export function listAllTutorsForAdmin(): AdminTutorView[] {
  return db.tutorProfiles.map((p) => {
    const user = db.users.find((u) => u.id === p.userId);
    const course = db.courses.find((c) => c.id === p.courseId);
    return {
      ...p,
      tutorName: user ? user.name : 'Unknown',
      tutorEmail: user ? user.email : null,
      courseCode: course ? course.code : null,
    };
  });
}

export function getAdminStats() {
  return {
    users: db.users.length,
    tutorProfiles: db.tutorProfiles.length,
    verifiedTutors: db.tutorProfiles.filter((p) => p.verified).length,
    helpRequests: db.helpRequests.length,
    openRequests: db.helpRequests.filter((r) => r.status === 'open').length,
    sessions: db.sessions.length,
    completedSessions: db.sessions.filter((s) => s.status === 'completed').length,
  };
}
