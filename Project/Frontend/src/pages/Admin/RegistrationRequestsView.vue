<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import { useAdminStore } from '@/stores/adminStore.ts'
import type { AccessRequest } from '@/types/accessRequest.ts'

const adminStore = useAdminStore()

const search = ref('')
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending')
const selectedId = ref<number | null>(1)
const loading = ref(false)

const mockRequests: AccessRequest[] = [
  {
    id: 1,
    firstName: 'Lea',
    lastName: 'Meier',
    institution: 'Kantonsschule Alpenblick',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    email: 'lea.meier@example.ch',
    createdAt: '11.11.2026',
    status: 'pending',
    additionalInformation: 'Ich möchte Cadence für meine Unterrichtsplanung nutzen.',
  },
  {
    id: 2,
    firstName: 'Jonas',
    lastName: 'Frei',
    institution: 'Berufsfachschule Sonnenberg',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    email: 'jonas.frei@example.ch',
    createdAt: '10.11.2026',
    status: 'pending',
    additionalInformation: null,
  },
  {
    id: 3,
    firstName: 'Nina',
    lastName: 'Keller',
    institution: 'Gymnasium Seeblick',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    email: 'nina.keller@example.ch',
    createdAt: '09.11.2026',
    status: 'pending',
    additionalInformation: null,
  },
]

const requests = ref<AccessRequest[]>([...mockRequests])

onMounted(async () => {
  try {
    await adminStore.getAccessRequests()
    if (adminStore.accessRequests?.length) {
      requests.value = [...adminStore.accessRequests]
    }
  } catch {}

  if (filteredRequests.value.length) {
    selectedId.value = filteredRequests.value[0]?.id ?? null
  }
})

watch(
  () => adminStore.accessRequests,
  (val) => {
    if (val?.length) {
      requests.value = [...val]
    }
  },
)

const pendingCount = computed(() => requests.value.filter((r) => r.status === 'pending').length)

const filteredRequests = computed(() => {
  const q = search.value.trim().toLowerCase()
  return requests.value.filter((r) => {
    if (r.status !== activeTab.value) return false
    if (!q) return true
    const name = `${r.firstName} ${r.lastName}`.toLowerCase()
    return (
      name.includes(q) ||
      r.institution.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.jobTitle || r.funktion || '').toLowerCase().includes(q)
    )
  })
})

const selected = computed(() => requests.value.find((r) => r.id === selectedId.value) ?? null)

watch(filteredRequests, (list) => {
  if (!list.some((r) => r.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function getInitials(first = '', last = '') {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function formatDate(val: string) {
  if (!val) return ''
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) return val
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
}

const statusMap: Record<string, { label: string; class: string }> = {
  pending: {
    label: 'Offen',
    class:
      'bg-[var(--warning-color-light,var(--color-amber-100))] text-[var(--warning-color,var(--color-amber-600))]',
  },
  approved: {
    label: 'Genehmigt',
    class: 'bg-[var(--primary-color-light)] text-[var(--success-color)]',
  },
  rejected: {
    label: 'Abgelehnt',
    class: 'bg-[var(--error-color-light)] text-[var(--error-color)]',
  },
}

async function handleApprove() {
  if (!selected.value) return
  const id = selected.value.id
  loading.value = true
  try {
    await adminStore.approveAccessRequest(id)
  } catch {}
  const item = requests.value.find((r) => r.id === id)
  if (item) item.status = 'approved'
  loading.value = false
  if (filteredRequests.value[0]) {
    selectedId.value = filteredRequests.value[0].id
  }
}

async function handleReject() {
  if (!selected.value) return
  const id = selected.value.id
  loading.value = true
  try {
    await adminStore.rejectAccessRequest(id)
  } catch {}
  const item = requests.value.find((r) => r.id === id)
  if (item) item.status = 'rejected'
  loading.value = false
  if (filteredRequests.value[0]) {
    selectedId.value = filteredRequests.value[0].id
  }
}
</script>

<template>
  <AppNavbar></AppNavbar>

  <SectionComp>
    <div class="px-4 py-8 sm:px-8">
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-4 min-w-0">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 bg-[var(--warning-color-light,var(--color-amber-100))] text-[var(--warning-color,var(--color-amber-600))]"
          >
            <i class="fa-solid fa-inbox text-xl sm:text-2xl"></i>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-[var(--primary-color)] truncate">
            Registrierungsanfragen
          </h1>
        </div>

        <label
          class="flex h-11 w-full sm:w-72 items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-3.5 text-sm text-[var(--text-color-light)] shrink-0"
        >
          <i class="fa-solid fa-magnifying-glass text-sm shrink-0"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Anfragen suchen ..."
            class="w-full min-w-0 bg-transparent text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-light)] outline-none"
          />
        </label>
      </header>

      <div class="border-b border-[var(--border-color)] flex items-center gap-6 sm:gap-8">
        <button
          type="button"
          @click="activeTab = 'pending'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'pending'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Offen ({{ pendingCount }})
        </button>

        <button
          type="button"
          @click="activeTab = 'approved'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'approved'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Genehmigt
        </button>

        <button
          type="button"
          @click="activeTab = 'rejected'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'rejected'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Abgelehnt
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        <div class="lg:col-span-6 flex flex-col gap-3">
          <div
            v-for="req in filteredRequests"
            :key="req.id"
            @click="selectedId = req.id"
            :class="
              selectedId === req.id
                ? 'border-[var(--primary-color)] bg-[var(--hover-light-color)] shadow-sm'
                : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--hover-light-color)]'
            "
            class="flex items-center justify-between p-4 rounded-2xl border transition duration-150 cursor-pointer gap-4"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="w-12 h-12 rounded-xl bg-[var(--primary-color-light)] text-[var(--primary-color)] font-bold text-base flex items-center justify-center shrink-0"
              >
                {{ getInitials(req.firstName, req.lastName) }}
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-base text-[var(--primary-color)] truncate">
                  {{ req.firstName }} {{ req.lastName }}
                </h3>
                <p class="text-xs sm:text-sm text-[var(--text-color-light)] truncate mt-0.5">
                  {{ req.institution }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                {{ formatDate(req.createdAt) }}
              </span>
              <i class="fa-solid fa-chevron-right text-xs text-[var(--text-color-light)]"></i>
            </div>
          </div>

          <div
            v-if="filteredRequests.length === 0"
            class="flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] text-center text-[var(--text-color-light)]"
          >
            <i class="fa-solid fa-magnifying-glass text-2xl mb-2"></i>
            <p class="text-sm font-medium text-[var(--text-color)]">Keine Anfragen gefunden</p>
            <p class="text-xs mt-1">In dieser Ansicht sind derzeit keine Einträge vorhanden.</p>
          </div>
        </div>

        <div class="lg:col-span-6">
          <div
            v-if="selected"
            class="border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm"
          >
            <div class="flex items-center justify-between gap-4 pb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-[var(--primary-color)] truncate">
                {{ selected.firstName }} {{ selected.lastName }}
              </h2>
              <span
                :class="statusMap[selected.status]?.class"
                class="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
              >
                {{ statusMap[selected.status]?.label }}
              </span>
            </div>

            <div class="flex flex-col gap-4 py-2">
              <div class="flex items-center gap-3">
                <i
                  class="fa-regular fa-envelope text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  E-Mail-Adresse
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)] break-all">
                  {{ selected.email }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <i
                  class="fa-solid fa-building-columns text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  Schule / Institution
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                  {{ selected.institution }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <i
                  class="fa-solid fa-user-group text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  Funktion
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                  {{ selected.jobTitle || selected.funktion }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <i
                  class="fa-regular fa-calendar text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  Eingegangen am
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                  {{ formatDate(selected.createdAt) }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5 pt-2">
                <div class="flex items-center gap-3">
                  <i
                    class="fa-regular fa-file-lines text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                  ></i>
                  <span class="text-xs sm:text-sm text-[var(--text-color-light)]">
                    Zusätzliche Informationen
                  </span>
                </div>
                <p class="text-xs sm:text-sm font-medium text-[var(--text-color)] pl-8">
                  {{
                    selected.additionalInformation ||
                    'Ich möchte Cadence für meine Unterrichtsplanung nutzen.'
                  }}
                </p>
              </div>
            </div>

            <div
              v-if="selected.status === 'pending'"
              class="flex items-center gap-4 mt-8 pt-6 border-t border-[var(--border-color)]/60"
            >
              <button
                type="button"
                @click="handleReject"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-xl border border-[var(--error-color)] bg-[var(--surface-color)] text-[var(--error-color)] text-sm font-medium hover:bg-[var(--error-color-light)] disabled:opacity-50 transition duration-200 cursor-pointer text-center"
              >
                Ablehnen
              </button>
              <button
                type="button"
                @click="handleApprove"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary-color)] text-[var(--text-color-white)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition duration-200 cursor-pointer text-center shadow-sm"
              >
                Genehmigen
              </button>
            </div>

            <div
              v-else
              class="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[var(--border-color)]/60 text-sm text-[var(--text-color-light)]"
            >
              <i
                :class="
                  selected.status === 'approved'
                    ? 'fa-solid fa-circle-check text-[var(--success-color)]'
                    : 'fa-solid fa-circle-xmark text-[var(--error-color)]'
                "
              ></i>
              <span>
                {{
                  selected.status === 'approved'
                    ? 'Diese Anfrage wurde genehmigt.'
                    : 'Diese Anfrage wurde abgelehnt.'
                }}
              </span>
            </div>
          </div>

          <div
            v-else
            class="border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl p-8 flex flex-col items-center justify-center text-center text-[var(--text-color-light)]"
          >
            <i class="fa-regular fa-id-card text-4xl mb-3"></i>
            <p class="text-sm font-medium text-[var(--text-color)]">Keine Anfrage ausgewählt</p>
            <p class="text-xs mt-1">
              Wähle eine Anfrage aus der Liste aus, um die Details anzuzeigen.
            </p>
          </div>
        </div>
      </div>
    </div>
  </SectionComp>
</template>
