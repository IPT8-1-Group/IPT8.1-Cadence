import { computed, ref } from 'vue'
import type { Ref } from 'vue'

export function useRequestState() {
  const pending = ref(0)
  const loading = computed(() => pending.value > 0)
  const error = ref<string | null>(null)

  let latestRequest = 0
  const latestLoad = new WeakMap<object, symbol>()

  async function runRequest<T>(request: () => Promise<T>, fallbackError: string): Promise<T | undefined> {
    const requestId = ++latestRequest
    pending.value += 1
    error.value = null

    try {
      return await request()
    } catch (e) {
      if (requestId === latestRequest) {
        error.value = e instanceof Error ? e.message : fallbackError
      }
    } finally {
      pending.value -= 1
    }
  }

  function invalidateData(state: object) {
    latestLoad.set(state, Symbol())
  }

  async function loadData<T>(state: Ref<T | null>, request: () => Promise<T>, fallbackError: string) {
    const loadId = Symbol()
    latestLoad.set(state, loadId)

    return await runRequest(async () => {
      const data = await request()

      if (latestLoad.get(state) === loadId) {
        state.value = data
      }

      return data
    }, fallbackError)
  }

  return { loading, error, runRequest, loadData, invalidateData }
}
