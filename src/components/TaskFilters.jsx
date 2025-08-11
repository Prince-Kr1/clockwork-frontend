import React from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { Listbox } from "@headlessui/react";

const TaskFilters = ({
  dateFilter,
  setDateFilter,
  priorityFilter,
  setPriorityFilter,
  sortOrder,
  setSortOrder
}) => {
  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' }
  ]

  const SelectField = ({ value, onChange, options, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* Button */}
          <Listbox.Button
            className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700
                      hover:border-amber-300 transition-colors cursor-pointer "
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
}


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-5 h-5 text-red-500" />
        <h3 className="text-md font-semibold text-gray-700">Filters</h3>
      </div>

      {/* Mobile Layout (Stacked) */}
      <div className="flex justify-between md:hidden space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 ml-2">Date</label>
          <SelectField
            value={dateFilter}
            onChange={setDateFilter}
            options={dateOptions}
            
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 ml-2">Priority</label>
          <SelectField
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 ml-2">Sort</label>
          <SelectField
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Desktop Layout (Grid) */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Date</label>
          <SelectField
            value={dateFilter}
            onChange={setDateFilter}
            options={dateOptions}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
          <SelectField
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Sort</label>
          <SelectField
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(dateFilter !== 'all' || priorityFilter !== 'all' || sortOrder !== 'newest') && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ">
                {dateOptions.find(opt => opt.value === dateFilter)?.label}
                <button
                  onClick={() => setDateFilter('all')}
                  className="ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                {priorityOptions.find(opt => opt.value === priorityFilter)?.label}
                <button
                  onClick={() => setPriorityFilter('all')}
                  className="ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {sortOrder !== 'newest' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                {sortOptions.find(opt => opt.value === sortOrder)?.label}
                <button
                  onClick={() => setSortOrder('newest')}
                  className="ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskFilters