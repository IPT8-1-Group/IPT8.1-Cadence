<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import AuthNavbar from '@/components/layout/AuthNavbar.vue'
import SectionComp from '@/components/ui/SectionComp.vue'
import { useAdminStore } from '@/stores/adminStore.ts'
import type { User, UserRole } from '@/types/auth.ts'

const adminStore = useAdminStore()

const search = ref('')
const activeTab = ref<'all' | 'active' | 'inactive'>('all')
const selectedId = ref<number | null>(1)
const loading = ref(false)
const isEditing = ref(false)
const showCreateModal = ref(false)

const editForm = ref({
  firstName: '',
  lastName: '',
  institution: '',
  jobTitle: '',
  role: 'user' as UserRole,
})

const createForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  institution: '',
  jobTitle: 'Lehrperson',
  role: 'user' as UserRole,
})

const mockUsers: User[] = [
  {
    id: 1,
    firstName: 'Lea',
    lastName: 'Meier',
    email: 'lea.meier@example.ch',
    institution: 'Kantonsschule Alpenblick',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    role: 'user',
    active: true,
    createdAt: '11.11.2026',
  },
  {
    id: 2,
    firstName: 'Jonas',
    lastName: 'Frei',
    email: 'jonas.frei@example.ch',
    institution: 'Berufsfachschule Sonnenberg',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    role: 'user',
    active: true,
    createdAt: '10.11.2026',
  },
  {
    id: 3,
    firstName: 'Nina',
    lastName: 'Keller',
    email: 'nina.keller@example.ch',
    institution: 'Gymnasium Seeblick',
    jobTitle: 'Lehrperson',
    funktion: 'Lehrperson',
    role: 'user',
    active: false,
    createdAt: '09.11.2026',
  },
  {
    id: 4,
    firstName: 'Marco',
    lastName: 'Baumann',
    email: 'marco.baumann@example.ch',
    institution: 'Kantonsschule Alpenblick',
    jobTitle: 'Administrator',
    funktion: 'Administrator',
    role: 'admin',
    active: true,
    createdAt: '08.11.2026',
  },
]

const users = ref<User[]>([...mockUsers])

onMounted(async () => {
  try {
    await adminStore.getUsers()
    if (adminStore.users?.length) {
      users.value = [...adminStore.users]
    }
  } catch {}

  if (filteredUsers.value.length) {
    selectedId.value = filteredUsers.value[0]?.id ?? null
  }
})

watch(
  () => adminStore.users,
  (val) => {
    if (val?.length) {
      users.value = [...val]
    }
  },
)

const isActive = (u: User) => Boolean(u.active)

const totalCount = computed(() => users.value.length)

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value.filter((u) => {
    if (activeTab.value === 'active' && !isActive(u)) return false
    if (activeTab.value === 'inactive' && isActive(u)) return false
    if (!q) return true
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase()
    return (
      name.includes(q) ||
      (u.institution ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      roleLabel(u.role).toLowerCase().includes(q)
    )
  })
})

const selected = computed(() => users.value.find((u) => u.id === selectedId.value) ?? null)

watch(filteredUsers, (list) => {
  if (!list.some((u) => u.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

watch(selectedId, () => {
  isEditing.value = false
})

function getInitials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

function getFullName(u: User) {
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return name || u.email
}

function roleLabel(role: UserRole) {
  return role === 'admin' ? 'Administrator' : 'Lehrperson'
}

function formatDate(val?: string | null) {
  if (!val) return '-'
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) return val
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
}

async function toggleActive() {
  if (!selected.value) return
  const id = selected.value.id
  const nextActive = !isActive(selected.value)
  loading.value = true
  try {
    await adminStore.updateUser(id, { active: nextActive })
  } catch {}
  const item = users.value.find((u) => u.id === id)
  if (item) item.active = nextActive
  loading.value = false
}

function startEdit() {
  if (!selected.value) return
  editForm.value = {
    firstName: selected.value.firstName ?? '',
    lastName: selected.value.lastName ?? '',
    institution: selected.value.institution ?? '',
    jobTitle: selected.value.jobTitle ?? selected.value.funktion ?? '',
    role: selected.value.role,
  }
  isEditing.value = true
}

async function saveEdit() {
  if (!selected.value) return
  const id = selected.value.id
  loading.value = true
  try {
    await adminStore.updateUser(id, {
      firstName: editForm.value.firstName.trim(),
      lastName: editForm.value.lastName.trim(),
      institution: editForm.value.institution.trim(),
      jobTitle: editForm.value.jobTitle.trim(),
      role: editForm.value.role,
    })
  } catch {}
  const item = users.value.find((u) => u.id === id)
  if (item) {
    item.firstName = editForm.value.firstName.trim()
    item.lastName = editForm.value.lastName.trim()
    item.institution = editForm.value.institution.trim()
    item.jobTitle = editForm.value.jobTitle.trim()
    item.funktion = editForm.value.jobTitle.trim()
    item.role = editForm.value.role
  }
  loading.value = false
  isEditing.value = false
}

function openCreateModal() {
  createForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    jobTitle: 'Lehrperson',
    role: 'user',
  }
  showCreateModal.value = true
}

function submitCreate() {
  if (!createForm.value.firstName.trim() || !createForm.value.email.trim()) return
  const nextId = Math.max(0, ...users.value.map((u) => u.id)) + 1
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const newUser: User = {
    id: nextId,
    firstName: createForm.value.firstName.trim(),
    lastName: createForm.value.lastName.trim(),
    email: createForm.value.email.trim(),
    institution: createForm.value.institution.trim(),
    jobTitle: createForm.value.jobTitle.trim() || roleLabel(createForm.value.role),
    funktion: createForm.value.jobTitle.trim() || roleLabel(createForm.value.role),
    role: createForm.value.role,
    active: true,
    createdAt: `${day}.${month}.${now.getFullYear()}`,
  }
  users.value.unshift(newUser)
  selectedId.value = newUser.id
  showCreateModal.value = false
}
</script>

<template>
  <AuthNavbar></AuthNavbar>

  <SectionComp>
    <div class="px-4 py-8 sm:px-8">
      <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div class="flex items-center gap-4 min-w-0">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 bg-[var(--primary-color-light)] text-[var(--primary-color)]"
          >
            <i class="fa-solid fa-user-group text-xl sm:text-2xl"></i>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-[var(--primary-color)] truncate">
            Benutzerverwaltung
          </h1>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <label
            class="flex h-11 w-full sm:w-64 md:w-72 items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-3.5 text-sm text-[var(--text-color-light)]"
          >
            <i class="fa-solid fa-magnifying-glass text-sm shrink-0"></i>
            <input
              v-model="search"
              type="text"
              placeholder="Benutzer suchen ..."
              class="w-full min-w-0 bg-transparent text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-light)] outline-none"
            />
          </label>

          <button
            type="button"
            @click="openCreateModal"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] px-4 text-sm font-medium text-[var(--text-color-white)] hover:opacity-90 transition duration-200 cursor-pointer shrink-0 shadow-sm"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Benutzer erstellen</span>
          </button>
        </div>
      </header>

      <div class="border-b border-[var(--border-color)] flex items-center gap-6 sm:gap-8">
        <button
          type="button"
          @click="activeTab = 'all'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'all'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Alle ({{ totalCount }})
        </button>

        <button
          type="button"
          @click="activeTab = 'active'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'active'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Aktiv
        </button>

        <button
          type="button"
          @click="activeTab = 'inactive'"
          class="pb-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b-[3px]"
          :class="
            activeTab === 'inactive'
              ? 'text-[var(--primary-color)] border-[var(--primary-color)]'
              : 'text-[var(--text-color-light)] border-transparent hover:text-[var(--text-color)]'
          "
        >
          Deaktiviert
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        <div class="lg:col-span-6 flex flex-col gap-3">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectedId = user.id"
            :class="
              selectedId === user.id
                ? 'border-[var(--primary-color)] bg-[var(--hover-light-color)] shadow-sm'
                : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--hover-light-color)]'
            "
            class="flex items-center justify-between p-4 rounded-2xl border transition duration-150 cursor-pointer gap-4"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="w-12 h-12 rounded-xl bg-[var(--primary-color-light)] text-[var(--primary-color)] font-bold text-base flex items-center justify-center shrink-0"
              >
                {{ getInitials(user.firstName, user.lastName) }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-base text-[var(--primary-color)] truncate">
                    {{ getFullName(user) }}
                  </h3>
                  <span
                    v-if="!isActive(user)"
                    class="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--secondary-color-light)] text-[var(--text-color-light)] shrink-0"
                  >
                    Deaktiviert
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-[var(--text-color-light)] truncate mt-0.5">
                  {{ user.institution || '-' }}
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-3 shrink-0 border-l border-[var(--border-color)] pl-4"
            >
              <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                {{ roleLabel(user.role) }}
              </span>
              <i class="fa-solid fa-chevron-right text-xs text-[var(--text-color-light)]"></i>
            </div>
          </div>

          <div
            v-if="filteredUsers.length === 0"
            class="flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] text-center text-[var(--text-color-light)]"
          >
            <i class="fa-solid fa-magnifying-glass text-2xl mb-2"></i>
            <p class="text-sm font-medium text-[var(--text-color)]">Keine Benutzer gefunden</p>
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
                {{ getFullName(selected) }}
              </h2>
              <span
                :class="
                  isActive(selected)
                    ? 'bg-[color-mix(in_srgb,var(--success-color)_15%,transparent)] text-[var(--success-color)]'
                    : 'bg-[var(--secondary-color-light)] text-[var(--text-color-light)]'
                "
                class="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
              >
                {{ isActive(selected) ? 'Aktiv' : 'Deaktiviert' }}
              </span>
            </div>

            <div v-if="!isEditing" class="flex flex-col gap-4 py-2">
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
                  {{ selected.institution || '-' }}
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
                  {{ selected.jobTitle || selected.funktion || '-' }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <i
                  class="fa-regular fa-id-badge text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  Rolle
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                  {{ roleLabel(selected.role) }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <i
                  class="fa-regular fa-calendar text-[var(--text-color-light)] text-base w-5 text-center shrink-0"
                ></i>
                <span
                  class="text-xs sm:text-sm text-[var(--text-color-light)] w-32 sm:w-44 shrink-0"
                >
                  Erstellt am
                </span>
                <span class="text-xs sm:text-sm font-medium text-[var(--text-color)]">
                  {{ formatDate(selected.createdAt) }}
                </span>
              </div>
            </div>

            <div v-else class="flex flex-col gap-4 py-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--text-color-light)]"
                    >Vorname</label
                  >
                  <input
                    v-model="editForm.firstName"
                    type="text"
                    class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--text-color-light)]"
                    >Nachname</label
                  >
                  <input
                    v-model="editForm.lastName"
                    type="text"
                    class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[var(--text-color-light)]">
                  Schule / Institution
                </label>
                <input
                  v-model="editForm.institution"
                  type="text"
                  class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--text-color-light)]"
                    >Funktion</label
                  >
                  <input
                    v-model="editForm.jobTitle"
                    type="text"
                    class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--text-color-light)]">Rolle</label>
                  <select
                    v-model="editForm.role"
                    class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
                  >
                    <option value="user">Lehrperson</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              v-if="!isEditing"
              class="flex items-center gap-4 mt-8 pt-6 border-t border-[var(--border-color)]/60"
            >
              <button
                type="button"
                @click="toggleActive"
                :disabled="loading"
                :class="
                  isActive(selected)
                    ? 'border-[var(--error-color)] text-[var(--error-color)] hover:bg-[var(--error-color-light)]'
                    : 'border-[var(--success-color)] text-[var(--success-color)] hover:bg-[color-mix(in_srgb,var(--success-color)_15%,transparent)]'
                "
                class="flex-1 py-2.5 px-4 rounded-xl border bg-[var(--surface-color)] text-sm font-medium disabled:opacity-50 transition duration-200 cursor-pointer text-center"
              >
                {{ isActive(selected) ? 'Deaktivieren' : 'Aktivieren' }}
              </button>
              <button
                type="button"
                @click="startEdit"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary-color)] text-[var(--text-color-white)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition duration-200 cursor-pointer text-center shadow-sm"
              >
                Bearbeiten
              </button>
            </div>

            <div
              v-else
              class="flex items-center gap-4 mt-8 pt-6 border-t border-[var(--border-color)]/60"
            >
              <button
                type="button"
                @click="isEditing = false"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] text-sm font-medium hover:bg-[var(--hover-light-color)] disabled:opacity-50 transition duration-200 cursor-pointer text-center"
              >
                Abbrechen
              </button>
              <button
                type="button"
                @click="saveEdit"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary-color)] text-[var(--text-color-white)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition duration-200 cursor-pointer text-center shadow-sm"
              >
                Speichern
              </button>
            </div>
          </div>

          <div
            v-else
            class="border border-[var(--border-color)] bg-[var(--surface-color)] rounded-2xl p-8 flex flex-col items-center justify-center text-center text-[var(--text-color-light)]"
          >
            <i class="fa-regular fa-id-card text-4xl mb-3"></i>
            <p class="text-sm font-medium text-[var(--text-color)]">Kein Benutzer ausgewählt</p>
            <p class="text-xs mt-1">
              Wähle einen Benutzer aus der Liste aus, um die Details anzuzeigen.
            </p>
          </div>
        </div>
      </div>
    </div>
  </SectionComp>

  <div
    v-if="showCreateModal"
    @click.self="showCreateModal = false"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--text-color)_30%,transparent)] p-4 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-xl"
    >
      <div class="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
        <h2 class="text-lg font-bold text-[var(--primary-color)]">Benutzer erstellen</h2>
        <button
          type="button"
          @click="showCreateModal = false"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-color-light)] hover:bg-[var(--hover-light-color)] cursor-pointer"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form @submit.prevent="submitCreate" class="flex flex-col gap-4 mt-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-[var(--text-color-light)]">Vorname</label>
            <input
              v-model="createForm.firstName"
              type="text"
              required
              class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-[var(--text-color-light)]">Nachname</label>
            <input
              v-model="createForm.lastName"
              type="text"
              required
              class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-[var(--text-color-light)]">E-Mail-Adresse</label>
          <input
            v-model="createForm.email"
            type="email"
            required
            class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-[var(--text-color-light)]">
            Schule / Institution
          </label>
          <input
            v-model="createForm.institution"
            type="text"
            class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-[var(--text-color-light)]">Funktion</label>
            <input
              v-model="createForm.jobTitle"
              type="text"
              class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-[var(--text-color-light)]">Rolle</label>
            <select
              v-model="createForm.role"
              class="h-10 rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary-color)]"
            >
              <option value="user">Lehrperson</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]/60">
          <button
            type="button"
            @click="showCreateModal = false"
            class="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] text-sm font-medium hover:bg-[var(--hover-light-color)] transition duration-200 cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            class="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary-color)] text-[var(--text-color-white)] text-sm font-medium hover:opacity-90 transition duration-200 cursor-pointer shadow-sm"
          >
            Erstellen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
