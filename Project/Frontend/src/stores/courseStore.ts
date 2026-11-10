import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createCourseApi, deleteCourseApi, getCourseByIdApi, getCoursesApi, updateCourseApi } from '@/api/course.api.ts'
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '@/types/course.ts'
import { useRequestState } from '@/stores/requestState.ts'

export const useCourseStore = defineStore('course', () => {
  const { loading, error, runRequest, loadData } = useRequestState()
  const coursesData = ref<Course[] | null>(null)

  async function getCourses() {
    return await loadData(coursesData, getCoursesApi, 'Kurse konnten nicht geladen werden.')
  }

  async function getCourseById(id: number) {
    return await runRequest(() => getCourseByIdApi(id), 'Kurs konnte nicht geladen werden.')
  }

  async function createCourse(course: CreateCourseRequest) {
    return await runRequest(() => createCourseApi(course), 'Kurs konnte nicht erstellt werden.')
  }

  async function updateCourse(id: number, course: UpdateCourseRequest) {
    return await runRequest(() => updateCourseApi(id, course), 'Kurs konnte nicht aktualisiert werden.')
  }

  async function deleteCourse(id: number) {
    const success = await runRequest(async () => {
      await deleteCourseApi(id)
      return true
    }, 'Kurs konnte nicht gelöscht werden.')

    return success ?? false
  }

  return { loading, error, coursesData, getCourses, getCourseById, createCourse, updateCourse, deleteCourse }
})
