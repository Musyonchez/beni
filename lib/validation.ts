import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, { error: 'Name must be at least 2 characters.' }),
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: z.string().min(6, { error: 'Password must be at least 6 characters.' }),
});

export const LoginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Password is required.' }),
});

export const TutorProfileSchema = z.object({
  courseId: z.coerce.number().int().positive({ error: 'Choose a course.' }),
  bio: z.string().trim().max(500).optional().default(''),
  availability: z.string().trim().min(2, { error: 'Describe your availability.' }),
});

export const HelpRequestSchema = z.object({
  courseId: z.coerce.number().int().positive({ error: 'Choose a course.' }),
  topic: z.string().trim().min(2, { error: 'Describe what you need help with.' }),
  preferredTimes: z.string().trim().max(200).optional().default(''),
});

export const BookSessionSchema = z.object({
  tutorId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive(),
  scheduledTime: z.string().min(1, { error: 'Pick a date and time.' }),
  helpRequestId: z.coerce.number().int().positive().optional(),
});

export const FeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, { error: 'Rating must be 1-5.' }).max(5, { error: 'Rating must be 1-5.' }),
  comment: z.string().trim().max(500).optional().default(''),
});
