import { useState, useMemo, useCallback } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Filter, Home as HomeIcon, Calendar as CalendarIcon, TrendingUp, Clock } from "lucide-react"
import TaskModal from "../components/AddTask"
import TaskItem from "../components/TaskItem"
import TaskFilters from "../components/TaskFilters"

import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPath"

import {
  WRAPPER, HEADER, ADD_BUTTON, STATS_GRID, STAT_CARD, ICON_WRAPPER, VALUE_CLASS, LABEL_CLASS,
  STATS, FILTER_OPTIONS, FILTER_LABELS, EMPTY_STATE, FILTER_WRAPPER, SELECT_CLASSES,
  TABS_WRAPPER, TAB_BASE, TAB_ACTIVE, TAB_INACTIVE
} from '../assets/dummy'

const Dashboard = () => {
  const { tasks, refreshTasks } = useOutletContext()
  const [filter, setFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const [dateFilter, setDateFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  // Calculate stats
  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === "low").length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === "medium").length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === "high").length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
  }), [tasks])

  // Calculate productivity insights
  const insights = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    const completedToday = tasks.filter(t => {
      if (t.status !== "COMPLETED" || !t.updatedAt) return false
      const updateDate = new Date(t.updatedAt)
      return updateDate >= today
    }).length

    const completedThisWeek = tasks.filter(t => {
      if (t.status !== "COMPLETED" || !t.updatedAt) return false
      const updateDate = new Date(t.updatedAt)
      return updateDate >= thisWeek
    }).length

    const overdueTasks = tasks.filter(t => {
      if (t.status === "COMPLETED" || !t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate < today
    }).length

    const dueTodayTasks = tasks.filter(t => {
      if (t.status === "COMPLETED" || !t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate.toDateString() === today.toDateString()
    }).length

    return {
      completedToday,
      completedThisWeek,
      overdueTasks,
      dueTodayTasks
    }
  }, [tasks])

  // Filter + Sort tasks (exclude completed) - FIXED COMPLETION LOGIC
  const filteredTasks = useMemo(() => {
    const now = new Date()
    // normalize day ranges
    const dayStart = new Date(now); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(now); dayEnd.setHours(23,59,59,999)

    const tomorrowStart = new Date(dayStart); tomorrowStart.setDate(dayStart.getDate() + 1)
    const tomorrowEnd = new Date(tomorrowStart); tomorrowEnd.setHours(23,59,59,999)

    const weekEnd = new Date(dayStart); weekEnd.setDate(dayStart.getDate() + 7); weekEnd.setHours(23,59,59,999)
    const monthEnd = new Date(dayStart); monthEnd.setMonth(dayStart.getMonth() + 1); monthEnd.setHours(23,59,59,999)

    const df = (dateFilter || "all").toString().toLowerCase()
    const pf = (priorityFilter || "all").toString().toLowerCase()
    const so = (sortOrder || "newest").toString().toLowerCase()

    return tasks
      // 1) EXCLUDE COMPLETED TASKS - Use consistent status check with TaskItem
      .filter(task => task.status !== "COMPLETED")

      // 2) date filter
      .filter(task => {
        if (df === "all") return true
        const dueRaw = task?.dueDate
        if (!dueRaw) return false // no dueDate -> exclude for date-specific filters
        const due = new Date(dueRaw)

        if (df === "today") return due >= dayStart && due <= dayEnd
        if (df === "tomorrow") return due >= tomorrowStart && due <= tomorrowEnd
        if (df === "week") return due >= dayStart && due <= weekEnd
        if (df === "month") {
          // same calendar month & year as today
          return due.getMonth() === dayStart.getMonth() && due.getFullYear() === dayStart.getFullYear()
        }
        return true
      })

      // 3) priority filter
      .filter(task => {
        if (pf === "all") return true
        return (task?.priority || "").toString().toLowerCase() === pf
      })

      // 4) sort (by createdAt -> created_at -> dueDate)
      .slice() // copy before sorting
      .sort((a, b) => {
        const getTime = (t) => {
          const dateCandidate = t?.createdAt || t?.created_at || t?.dueDate
          const d = dateCandidate ? new Date(dateCandidate) : null
          return d ? d.getTime() : 0
        }
        const ta = getTime(a)
        const tb = getTime(b)
        return so === "newest" ? tb - ta : ta - tb
      })
  }, [tasks, dateFilter, priorityFilter, sortOrder])

  // Save tasks
  const handleTaskSave = useCallback(async (taskData) => {
    try {
      if (taskData.id) {
        await axiosInstance.put(API_PATHS.TASK.UPDATE(taskData.id), taskData)
      }
      refreshTasks()
      setShowModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }, [refreshTasks])


  return (
    <div className={`${WRAPPER} max-w-7xl mx-auto`}>
      {/* Header - Enhanced Responsive */}
      <div className={`${HEADER} flex-col sm:flex-row gap-3 sm:gap-4`}>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-red-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 sm:ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <button onClick={() => setShowModal(true)} className={`${ADD_BUTTON} w-full sm:w-auto`}>
          <Plus size={18} />
          <span className="sm:inline">Add New Task</span>
        </button>
      </div>


      {/* Stats */}
      <div className={STATS_GRID}>
        {STATS.map(({ key, label, icon: Icon, borderColor = "border-slate-200", valueKey, gradient }, index) => {
          // Define distinct color schemes for each stat
          const colorSchemes = [
            { border: "border-purple-200", bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", value: "text-purple-700" },
            { border: "border-emerald-200", bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
            { border: "border-amber-200", bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", value: "text-amber-700" },
            { border: "border-rose-200", bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", value: "text-rose-700" },
            { border: "border-cyan-200", bg: "bg-cyan-50", icon: "bg-cyan-100 text-cyan-600", value: "text-cyan-700" }
          ]
          const scheme = colorSchemes[index % colorSchemes.length]
          
          return (
            <div key={key} className={`${STAT_CARD} ${scheme.border} ${scheme.bg} hover:shadow-md transition-all duration-200`}>
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${scheme.icon} shadow-sm`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`${VALUE_CLASS} ${gradient ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" : scheme.value} font-bold`}>
                    {stats[valueKey]}
                  </p>
                  <p className={`${LABEL_CLASS} text-gray-600 font-medium`}>{label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4 md:space-y-6">
        <TaskFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Task List */}
        <div className="space-y-3 md:space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={`${EMPTY_STATE.wrapper} p-6 md:p-8 text-center`}>
              <div className={`${EMPTY_STATE.iconWrapper} mx-auto mb-4`}>
                <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {filter === "all" ? "Create tasks to start the day!" : "No tasks match the current filters"}
              </p>
            </div>
          ) : (
            <>
              {/* Task Count Indicator */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-red-600">{filteredTasks.length}</span> 
                  {filteredTasks.length === 1 ? ' task' : ' tasks'}
                </p>
                
                {/* Quick Filter Reset */}
                {(dateFilter !== 'all' || priorityFilter !== 'all' || sortOrder !== 'newest') && (
                  <button
                    onClick={() => {
                      setDateFilter('all')
                      setPriorityFilter('all')
                      setSortOrder('newest')
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-3 md:space-y-4">
                {filteredTasks.map(task => (
                  <TaskItem
                    key={task._id || task.id}
                    task={task}
                    onRefresh={refreshTasks}
                    showCompleteCheckbox
                    onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-18 right-6 md:hidden bg-gradient-to-r from-amber-300 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => { setShowModal(false); setSelectedTask(null); }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  )
}

export default Dashboard