import { apiFetch } from '@/api/api.ts'
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '@/types/course.ts'

export async function getCoursesApi(): Promise<Course[]> {
  return apiFetch<Course[]>('/courses', {
    method: 'GET'
  })
}

export async function getCourseByIdApi(id: number): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`, {
    method: 'GET'
  })
}

export async function createCourseApi(course: CreateCourseRequest): Promise<Course> {
  return apiFetch<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  })
}

export async function updateCourseApi(id: number, course: UpdateCourseRequest): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course)
  })
}

export async function deleteCourseApi(id: number): Promise<void> {
  return apiFetch<void>(`/courses/${id}`, {
    method: 'DELETE'
  })
}
