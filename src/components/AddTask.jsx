import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle, X, Save, Calendar, AlignLeft, Flag, CheckCircle
} from 'lucide-react';
import { baseControlClasses, priorityStyles } from '../assets/dummy';
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import SelectField from './SelectField';

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const today = new Date().toISOString().split('T')[0];

  const initialTask = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'LOW',
    status: 'IN_PROGRESS',
  };

  const [taskData, setTaskData] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTaskData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        priority: taskToEdit.priority || 'LOW',
        status: taskToEdit.status || 'IN_PROGRESS',
        id: taskToEdit._id || taskToEdit.id,
      });
    } else {
      setTaskData(initialTask);
    }

    setError(null);
  }, [isOpen, taskToEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  }, []);

  const priorityOptions = [
    { value: 'LOW', label: 'LOW' },
    { value: 'MEDIUM', label: 'MEDIUM' },
    { value: 'HIGH', label: 'HIGH' }
  ];

  const statusOptions = [
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'COMPLETED', label: 'COMPLETED' }
  ];

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isEdit = Boolean(taskData.id);
      const url = isEdit ? API_PATHS.TASK.UPDATE(taskData.id) : API_PATHS.TASK.ADD;
      const method = isEdit ? 'put' : 'post';

      // Strip `id` field if not editing
      const payload = { ...taskData };
      if (!isEdit) delete payload.id;

      const { data } = await axiosInstance[method](url, payload);
      onSave?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        onLogout?.();
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }, [taskData, today, onSave, onClose, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-100 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? <Save className="text-red-500 w-5 h-5" /> : <PlusCircle className="text-red-500 w-5 h-5" />}
            {taskData.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative overflow-visible">
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Task Title</label>
            <div className="flex items-center border border-red-100 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-amber-300 focus-within:border-amber-300 transition-all duration-200">
              <input
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className="w-full focus:outline-none text-sm"
                placeholder="Enter task title"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Description</label>
            <textarea
              name="description"
              rows="3"
              value={taskData.description}
              onChange={handleChange}
              className={baseControlClasses}
              placeholder="Add details about your task"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`${baseControlClasses} `}
              >
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={taskData.dueDate}
                onChange={handleChange}
                className={`${baseControlClasses} relative z-10`}
                style={{ position: 'relative' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className={baseControlClasses}
            >
              <option>IN_PROGRESS</option>
              <option>COMPLETED</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-red-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {loading
              ? 'Saving...'
              : taskData.id
                ? <><Save className="w-4 h-4" /> Update Task</>
                : <><PlusCircle className="w-4 h-4" /> Create Task</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;