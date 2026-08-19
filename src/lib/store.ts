import type { DB, Exercise, LiftSession, LiftSet, Session } from '../types'
import exercisesSeed from '../data/exercises.json'
import horsesSeed from '../data/horses.json'

const STORAGE_KEY = 'training-log:db'

function defaultDB(): DB {
  return {
    version: 1,
    settings: {
      bodyweightKg: 75,
      weeklySessionTarget: 4,
    },
    customExercises: [],
    sessions: [],
  }
}

export function loadDB(): DB {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultDB()
  try {
    const parsed = JSON.parse(raw) as DB
    if (parsed.version !== 1) return defaultDB()
    return parsed
  } catch {
    return defaultDB()
  }
}

export function saveDB(db: DB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function addSession(session: Session): DB {
  const db = loadDB()
  db.sessions.push(session)
  saveDB(db)
  return db
}

export function deleteSession(id: string): DB {
  const db = loadDB()
  db.sessions = db.sessions.filter((s) => s.id !== id)
  saveDB(db)
  return db
}

export function allExercises(db: DB): Exercise[] {
  return [...(exercisesSeed as Exercise[]), ...db.customExercises]
}

export function addCustomExercise(exercise: Exercise): DB {
  const db = loadDB()
  db.customExercises.push(exercise)
  saveDB(db)
  return db
}

export function todayLocalDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function newId(): string {
  return crypto.randomUUID()
}

function sessionsMostRecentFirst(db: DB): Session[] {
  return [...db.sessions]
    .reverse()
    .sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1))
}

export function lastLiftSession(db: DB): LiftSession | undefined {
  return sessionsMostRecentFirst(db).find(
    (s): s is LiftSession => s.type === 'lift',
  )
}

export function lastSetForExercise(
  db: DB,
  exerciseId: string,
): LiftSet | undefined {
  for (const session of sessionsMostRecentFirst(db)) {
    if (session.type !== 'lift') continue
    for (let i = session.sets.length - 1; i >= 0; i--) {
      if (session.sets[i].exerciseId === exerciseId) return session.sets[i]
    }
  }
  return undefined
}

export function knownHorses(db: DB): string[] {
  const names = new Set<string>(horsesSeed as string[])
  for (const session of db.sessions) {
    if (session.type === 'polo') session.horses.forEach((h) => names.add(h))
  }
  return [...names].sort()
}

export function exportJSON(): string {
  return JSON.stringify(loadDB(), null, 2)
}

export function importJSON(json: string): DB {
  const parsed = JSON.parse(json) as DB
  if (parsed.version !== 1) throw new Error('Unsupported data version')
  saveDB(parsed)
  return parsed
}
