import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, Filter, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import TaskItem from "../components/TaskItem";
import { SORT_OPTIONS, CT_CLASSES } from "../assets/dummy";
import { format } from "date-fns"; 

const CompletedTasks = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");

  const sortedCompletedTasks = useMemo(() => {
    return tasks
      .filter(task => task.status === "COMPLETED") // Updated check
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "priority": {
            const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return order[b.priority] - order[a.priority];
          }
          default:
            return 0;
        }
      });
  }, [tasks, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' }
  ];

  const SelectField = ({ value, onChange, options, className = "" }) => {
    return (
      <div className={`relative ${className}`}>
        <Listbox value={value} onChange={onChange}>
          <div className="relative">
            {/* Button */}
            <Listbox.Button
              className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700
                         hover:border-amber-300 transition-colors cursor-pointer"
            >
              <span>
                {options.find((option) => option.value === value)?.label || "Select"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Listbox.Button>

            {/* Options */}
            <Listbox.Options
              className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 focus:outline-none"
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active, selected }) =>
                    `cursor-pointer px-3 py-2 text-sm ${
                      active ? "bg-amber-50 text-amber-700" : "text-gray-700"
                    } ${selected ? "font-medium bg-amber-100" : ""}`
                  }
                >
                  {option.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    );
  };

  return (
    <div className={CT_CLASSES.page}>

      {/* Header */}
      <div className={CT_CLASSES.header}>
        <div className={CT_CLASSES.titleWrapper}>
          <h1 className={CT_CLASSES.title}>
            <CheckCircle2 className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
            <span className="truncate">Completed Tasks</span>
          </h1>
        </div>
      </div>

      {/* Sorting Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4 md:mb-6">
        {/* Sorting Header */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-700">Sort Options</h3>
        </div>

        {/* Mobile Layout */}
        <div className="block md:hidden space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort by</label>
            <SelectField
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-gray-600 mb-2">Sort by</label>
            <SelectField
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className={CT_CLASSES.list}>
        {sortedCompletedTasks.length === 0 ? (
          <div className={CT_CLASSES.emptyState}>
            <div className={CT_CLASSES.emptyIconWrapper}>
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            <h3 className={CT_CLASSES.emptyTitle}>No completed tasks yet!</h3>
            <p className={CT_CLASSES.emptyText}>Complete some tasks and they'll appear here</p>
          </div>
        ) : (
          <>
            {/* Task Count Indicator */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-3 md:mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-red-600">{sortedCompletedTasks.length}</span> 
                {sortedCompletedTasks.length === 1 ? ' completed task' : ' completed tasks'}
              </p>
              
              {/* Quick Sort Reset */}
              {sortBy !== 'newest' && (
                <button
                  onClick={() => setSortBy('newest')}
                  className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                >
                  Reset Sort
                </button>
              )}
            </div>

            {/* Tasks */}
            <div className="space-y-3 md:space-y-4">
              {sortedCompletedTasks.map(task => (
                <div key={task.id} className="flex flex-col gap-1">
                  <TaskItem
                    task={task}
                    onRefresh={refreshTasks}
                    showCompleteCheckbox={false}
                    className="opacity-90 hover:opacity-100 transition-opacity text-sm md:text-base"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompletedTasks;