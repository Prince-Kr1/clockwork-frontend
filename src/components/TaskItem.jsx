import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import TaskModal from "./AddTask";
import {
  getPriorityColor,
  getPriorityBadgeColor,
  TI_CLASSES,
  MENU_OPTIONS,
} from "../assets/dummy";
import {
  CheckCircle2,
  MoreVertical,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckbox = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.status === "COMPLETED");
  const [showEditModal, setShowEditModal] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsCompleted(task.status === "COMPLETED");
  }, [task.status]);

  const handleComplete = async () => {
    const newStatus = isCompleted ? "IN_PROGRESS" : "COMPLETED";

    // optimistic UI change
    setIsCompleted(prev => !prev);

    try {
      await axiosInstance.put(API_PATHS.TASK.UPDATE_STATUS(task.id), { status: newStatus });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      // revert UI if API failed
      setIsCompleted(prev => !prev);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModal(true);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASK.DELETE(task.id));
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const { ...payload } = updatedTask;
      await axiosInstance.put(API_PATHS.TASK.UPDATE(task.id), payload);
      setShowEditModal(false);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  // Truncate description to 30 words
  const truncateDescription = (text, wordLimit = 29) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Check if description needs truncation
  const needsTruncation = task.description && task.description.split(' ').length > 25;


  return (
    <>
      <div className={`${TI_CLASSES.wrapper}  transition-all duration-300 group relative`}>
        <div className="flex flex-col w-full">
          {/* Main Content Row */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            {showCompleteCheckbox && (
              <label 
                className={`${TI_CLASSES.completeBtn} cursor-pointer flex items-center hover:scale-110 transition-transform duration-200 mt-1`} 
                aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleComplete}
                  className="sr-only"
                  aria-checked={isCompleted}
                />
                <CheckCircle2
                  size={20}
                  className={`${TI_CLASSES.checkboxIconBase} transition-all duration-300 ${
                    isCompleted 
                      ? 'text-green-500 fill-green-500 drop-shadow-sm' 
                      : 'text-green-300 hover:text-green-400 hover:scale-105'
                  }`}
                />
              </label>
            )}

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Title and Priority Row with Expand/Collapse Button */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className={`${TI_CLASSES.titleBase} flex-1 min-w-0 ${
                  isCompleted 
                    ? 'text-gray-400 line-through' 
                    : 'text-gray-800 group-hover:text-gray-900'
                } transition-colors duration-200`}>
                  {task.title}
                </h3>

                <span className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(task.priority)} shrink-0 text-xs font-medium px-2 py-1 rounded-full shadow-sm`}>
                  {task.priority}
                </span>
                
                {/* Expand/Collapse Button - Only show if description exists */}
                {(task.description || subtasks.length > 0) && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 rounded-full hover:bg-amber-50 transition-all duration-200 text-amber-300 hover:text-red-500 ml-2 cursor-pointer"
                    aria-label={isExpanded ? "Collapse task" : "Expand task"}
                  >
                    {isExpanded ? (
                      <ChevronUp size={18} className="transition-transform duration-200" />
                    ) : (
                      <ChevronDown size={18} className="transition-transform duration-200" />
                    )}
                  </button>
                )}
              </div>

              {/* Description - Conditional rendering based on expansion */}
              {task.description && (
                <div className="overflow-hidden transition-all duration-300">
                  <p className={`${TI_CLASSES.description} text-gray-600 text-sm mb-2 leading-relaxed break-words whitespace-normal transition-all duration-300 sm:mr-15 lg:mr-32 `}>
                    {isExpanded ? task.description : truncateDescription(task.description)}
                  </p>
                  
                  {/* Show expand hint if truncated and collapsed */}
                  {needsTruncation && !isExpanded && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-xs text-amber-300 hover:text-red-400 font-medium transition-colors duration-200 mb-2 cursor-pointer"
                    >
                      Read more...
                    </button>
                  )}
                </div>
              )}

              {/* Subtasks - Show when expanded or always if no description */}
              {subtasks.length > 0 && (isExpanded || !task.description) && (
                <div className={`${TI_CLASSES.subtasksContainer} bg-gray-50 rounded-lg p-3 mt-3 border border-gray-100 mb-3 transition-all duration-300 ${
                  isExpanded ? 'animate-in fade-in slide-in-from-top-2' : ''
                }`}>
                  <div className="flex items-center justify-between text-xs text-gray-600 font-semibold mb-2">
                    <span>Subtasks Progress</span>
                    <span className="text-red-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className={`${TI_CLASSES.progressBarBg} bg-gray-200 rounded-full h-2 mb-3 overflow-hidden`}>
                    <div 
                      className={`${TI_CLASSES.progressBarFg} bg-gradient-to-r from-red-500 to-amber-300 h-full rounded-full transition-all duration-500 ease-out`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>

                  <div className="space-y-2">
                    {subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-3 group/subtask hover:bg-white rounded-md p-2 -m-2 transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => setSubtasks(prev =>
                            prev.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s)
                          )}
                          className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 transition-colors"
                        />
                        <span className={`text-sm flex-1 min-w-0 transition-all duration-200 ${
                          st.completed 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-700 group-hover/subtask:text-red-700'
                        }`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Due Date, Created Date, and Menu */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {/* Due Date - Left */}
            <div className={`flex items-center gap-2 text-xs font-medium text-red-500 bg-amber-50 px-2 py-1 rounded-md transition-colors duration-200`}>
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">
                {task.dueDate 
                  ? (isToday(new Date(task.dueDate)) ? 'Due Today' : `Due ${format(new Date(task.dueDate), 'MMM dd')}`)
                  : 'No due date'
                }
              </span>
            </div>

            {/* Right Side: Created Date and Menu */}
            <div className="flex items-center gap-2">
              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap">
                  {task.createdAt
                    ? `Created ${format(new Date(task.createdAt), 'MMM dd')}`
                    : 'No date'
                  }
                </span>
              </div>

              {/* Menu Button */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className={`${TI_CLASSES.menuButton} p-2 rounded-full hover:bg-amber-50 transition-all duration-200 opacity-60 group-hover:opacity-100 cursor-pointer`}
                >
                  <MoreVertical size={16} className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className={`${TI_CLASSES.menuDropdown} absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-32 overflow-hidden`}>
                    {MENU_OPTIONS.map(opt => (
                      <button
                        key={opt.action}
                        onClick={() => handleAction(opt.action)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors duration-200 text-gray-700 cursor-pointer"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>

      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        taskToEdit={task}
        onSave={handleSave}
        onLogout={onLogout}
      />
    </>
  );
};

export default TaskItem;