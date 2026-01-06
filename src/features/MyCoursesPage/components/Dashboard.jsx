import React, { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useCourseStore } from '../../../store/courseStore'
import { CalendarDays, Flame, PlayCircle, ShoppingBag, Clock, Star, Trophy, BookOpen } from 'lucide-react'

function StreakHeatmap({ streakDaysSet }) {
  const weeks = 52 // Pełny rok - 52 tygodnie
  const today = new Date()
  
  // Oblicz początek roku (1 stycznia)
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const mondayThisWeek = (() => {
    const d = new Date(startOfYear)
    const day = d.getDay() === 0 ? 7 : d.getDay() // 1..7 with Monday=1
    d.setDate(d.getDate() - (day - 1))
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const weekColumns = Array.from({ length: weeks }).map((_, wIdx) => {
    const start = new Date(mondayThisWeek)
    start.setDate(mondayThisWeek.getDate() + wIdx * 7)
    const days = Array.from({ length: 7 }).map((__, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      const active = streakDaysSet.has(key)
      return { key, d, active }
    })
    return days
  })

  const monthShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']
  const dayShort = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'] // Poniedziałek do Niedzieli
  
  // Etykiety miesięcy - pokazuj dla każdego miesiąca
  const monthLabels = weekColumns.map((week, idx) => {
    const firstDay = week[0].d
    const isMonthStart = firstDay.getDate() <= 7 // pierwszy tydzień miesiąca
    return isMonthStart ? monthShort[firstDay.getMonth()] : ''
  })

  return (
    <div className="flex gap-2">
      {/* Dni tygodnia */}
      <div className="flex flex-col gap-[2px] text-[10px] text-gray-500 select-none">
        {dayShort.map((day, i) => (
          <div key={i} className="h-[10px] flex items-center justify-center text-[8px]">
            {day}
          </div>
        ))}
      </div>
      
      {/* Kalendarz */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-[2px]">
          {weekColumns.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[2px]">
              {week.map((cell, i) => (
                <div
                  key={cell.key}
                  title={cell.key}
                  className={`w-[10px] h-[10px] rounded-[2px] border border-blackText/10 dark:border-white/10 ${
                    cell.active
                      ? 'bg-primaryBlue dark:bg-primaryGreen'
                      : 'bg-gray-300 dark:bg-DarkblackText'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Etykiety miesięcy */}
        <div className="flex text-[10px] text-gray-500 gap-[2px] select-none">
          {monthLabels.map((m, i) => (
            <div key={i} className="w-[10px] text-center">{m}</div>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Aktywność</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-[2px] bg-gray-300 dark:bg-DarkblackText border border-blackText/10 dark:border-white/10"/>
            <div className="w-3 h-3 rounded-[2px] bg-primaryBlue dark:bg-primaryGreen"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const userPoints = useAuthStore((s) => s.userPoints)
  const purchasedCourses = useAuthStore((s) => s.purchasedCourses)
  const purchasedEbooks = useAuthStore((s) => s.purchasedEbooks)
  const courses = useCourseStore((s) => s.courses)

  const [streak, setStreak] = useState(0)
  const [streakDaysSet, setStreakDaysSet] = useState(new Set())
  const [lastVisit, setLastVisit] = useState(null)

  const numEbooks = purchasedEbooks?.length || 0

  // Oblicz największą serię z streakDaysSet
  const maxStreak = useMemo(() => {
    if (!streakDaysSet || streakDaysSet.size === 0) return 0
    
    const days = Array.from(streakDaysSet).sort()
    if (days.length === 0) return 0
    
    let max = 1
    let current = 1
    
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1])
      const curr = new Date(days[i])
      const diff = (curr - prev) / (1000 * 60 * 60 * 24)
      
      if (diff === 1) {
        current++
        max = Math.max(max, current)
      } else {
        current = 1
      }
    }
    
    return max
  }, [streakDaysSet])

  useEffect(() => {
    if (!user?.id) return
    const key = `streak_${user.id}`
    const raw = localStorage.getItem(key)
    let data = { current: 0, lastDate: null, days: [] }
    if (raw) {
      try { data = JSON.parse(raw) } catch {}
    }

    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const last = data.lastDate ? new Date(data.lastDate) : null

    const isSameDay = last && last.toDateString() === today.toDateString()
    if (!isSameDay) {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const wasYesterday = last && last.toDateString() === yesterday.toDateString()
      data.current = wasYesterday ? (data.current || 0) + 1 : 1
      data.lastDate = todayStr
      const setDays = new Set(data.days || [])
      setDays.add(todayStr)
      data.days = Array.from(setDays)
      try {
        const dailyAwardKey = `daily_award_${user.id}_${todayStr}`
        if (!localStorage.getItem(dailyAwardKey)) {
          const { awardPoints } = useAuthStore.getState()
          awardPoints(5, 'daily_login', todayStr)
          localStorage.setItem(dailyAwardKey, '1')
        }
      } catch {}
      localStorage.setItem(key, JSON.stringify(data))
    }

    setStreak(data.current || 0)
    setStreakDaysSet(new Set(data.days || []))
    setLastVisit(data.lastDate || null)
  }, [user?.id])

  const formatDate = (iso) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col items-start w-full mt-2">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6 mt-18 md:mt-0">
        Panel użytkownika
      </span>

      <div className="w-full bg-white dark:bg-DarkblackText rounded-2xl shadow-[0_0_6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 px-8 py-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl shadow-sm">
              <Trophy className="text-orange-600 dark:text-orange-400 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm opacity-70 dark:text-gray-300">Największa seria</span>
              <span className="text-2xl font-bold dark:text-white">{maxStreak} dni</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl shadow-sm">
              <BookOpen className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm opacity-70 dark:text-gray-300">Kupione ebooki</span>
              <span className="text-2xl font-bold dark:text-white">{numEbooks}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl shadow-sm">
              <Star className="text-green-600 dark:text-green-400 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm opacity-70 dark:text-gray-300">Punkty</span>
              <span className="text-2xl font-bold dark:text-white">{userPoints || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-DarkblackText rounded-xl shadow-[0_0_6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" />
            <h3 className="text-lg font-bold dark:text-white">Streak</h3>
          </div>
          <span className="text-2xl font-extrabold dark:text-white">{streak} dni</span>
        </div>
        <div className="overflow-x-auto">
          <StreakHeatmap streakDaysSet={streakDaysSet} />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm opacity-80 dark:text-gray-200">
          <Clock className="w-4 h-4" />
          <span>Ostatnia wizyta: {formatDate(lastVisit)}</span>
        </div>
        <p className="mt-3 text-sm opacity-70 dark:text-gray-300">Wejdź codziennie, aby podtrzymać serię. Kwadraty wypełniają się, gdy odwiedzasz stronę.</p>
      </div>
    </div>
  )
}


