import { apiFetch } from '@/api/api.ts'
import type {
  Course,
  CourseDay,
  CreateCourseDayRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/types/course.ts'

export async function getCoursesApi(): Promise<Course[]> {
  return apiFetch<Course[]>('/courses', {
    method: 'GET',
  })
}

export async function getCourseByIdApi(id: number): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`, {
    method: 'GET',
  })
}

export async function createCourseApi(course: CreateCourseRequest): Promise<Course> {
  return apiFetch<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  })
}

export async function updateCourseApi(id: number, course: UpdateCourseRequest): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  })
}

export async function deleteCourseApi(id: number): Promise<void> {
  return apiFetch<void>(`/courses/${id}`, {
    method: 'DELETE',
  })
}

export function getCourseDaysApi(courseId: number): Promise<CourseDay[]> {
  return apiFetch(`/courses/${courseId}/days`)
}

export function createCourseDayApi(
  courseId: number,
  day: CreateCourseDayRequest,
): Promise<CourseDay> {
  return apiFetch(`/courses/${courseId}/days`, { method: 'POST', body: JSON.stringify(day) })
}

export function updateCourseDayApi(
  courseId: number,
  dayId: number,
  day: CreateCourseDayRequest,
): Promise<CourseDay> {
  return apiFetch(`/courses/${courseId}/days/${dayId}`, {
    method: 'PUT',
    body: JSON.stringify(day),
  })
}

export function deleteCourseDayApi(courseId: number, dayId: number): Promise<void> {
  return apiFetch(`/courses/${courseId}/days/${dayId}`, { method: 'DELETE' })
}

export function updateCourseAssessmentApi(
  courseId: number,
  assessment: string | null,
): Promise<{ assessment: string | null }> {
  return apiFetch(`/courses/${courseId}/assessment`, {
    method: 'PUT',
    body: JSON.stringify({ assessment }),
  })
}
