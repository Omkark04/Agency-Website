import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { FiPlus, FiFilter, FiSearch, FiCalendar, FiCheck, FiClock, FiTrash2, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamTasks, createTask, updateTask, deleteTask, getTeamProjects } from '@/api/teamHeadApi';
import type { Task as APITask } from '@/api/teamHeadApi';

// Custom DraggableItem component with proper TypeScript types
type DraggableItemProps = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  children: React.ReactNode;
  className?: string;
};

const DraggableItem = ({ provided, snapshot, children, className }: DraggableItemProps) => {
  // Separate drag props to avoid conflicts
  const { draggableProps, dragHandleProps } = provided;
  
  return (
    <motion.div
      ref={provided.innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: snapshot.isDragging ? 1.02 : 1,
        boxShadow: snapshot.isDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none'
      }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      style={{
        ...draggableProps.style,
      }}
    >
      {children}
    </motion.div>
  );
};

// Types
type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'review' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignee: string;
  tags: string[];
}

const statuses: { id: Status; name: string; color: string }[] = [
  { id: 'todo', name: 'To Do', color: 'bg-gray-200' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-blue-200' },
  { id: 'review', name: 'Review', color: 'bg-yellow-200' },
  { id: 'completed', name: 'Completed', color: 'bg-green-200' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: '',
    tags: []
  });

  // Data transformation functions
  const transformTaskFromAPI = (apiTask: APITask): Task => ({
    id: apiTask.id.toString(),
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status.replace('_', '-') as Status,
    priority: (typeof apiTask.priority === 'string'
      ? apiTask.priority.toLowerCase()
      : apiTask.priority_value === 1 ? 'low'
        : apiTask.priority_value === 3 ? 'high'
          : 'medium') as Priority,
    dueDate: apiTask.due_date || '',
    assignee: apiTask.assignee?.name || '',
    tags: []
  });

  const transformTaskToAPI = (task: Partial<Task>) => {
    const apiData: any = {};

    if (task.title !== undefined) apiData.title = task.title;
    if (task.description !== undefined) apiData.description = task.description;
    if (task.status !== undefined) apiData.status = task.status.replace('-', '_');
    if (task.priority !== undefined) {
      apiData.priority = task.priority === 'low' ? 1 : task.priority === 'medium' ? 2 : 3;
    }
    if (task.dueDate !== undefined) apiData.due_date = task.dueDate;
    if (task.assignee !== undefined && task.assignee !== '') {
      const assigneeId = parseInt(task.assignee);
      if (!isNaN(assigneeId)) {
        apiData.assignee = assigneeId;
      }
    }

    return apiData;
  };

  // Fetch tasks and projects on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [tasksData, projectsData] = await Promise.all([
        getTeamTasks(),
        getTeamProjects()
      ]);

      const transformedTasks = tasksData.map(transformTaskFromAPI);
      setTasks(transformedTasks);
      setProjects(projectsData.map(p => ({ id: p.id, name: p.name })));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks based on search and filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Group tasks by status
  const tasksByStatus = statuses.map(status => ({
    ...status,
    items: filteredTasks.filter(task => task.status === status.id)
  }));

  // Handle drag and drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Update locally first (optimistic update)
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as Status;
      const updatedTask = { ...task, status: newStatus };
      setTasks(tasks.map(t => (t.id === draggableId ? updatedTask : t)));

      // Update backend
      try {
        await updateTask(parseInt(draggableId), {
          status: newStatus.replace('-', '_')
        });
      } catch (err: any) {
        // Revert on error
        setTasks(tasks.map(t => (t.id === draggableId ? task : t)));
        console.error('Task update error:', err);
        const errorMessage = err.response?.data?.detail || err.response?.data?.status?.[0] || err.message || 'Failed to update task status';
        alert(`Failed to update task: ${errorMessage}`);
      }
    }
  };


  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projects.length) {
      alert('No projects available. Please create a project first.');
      return;
    }

    try {
      const apiData = transformTaskToAPI(newTask);
      const createdTask = await createTask({
        ...apiData,
        order: projects[0].id // Use first project for now
      });

      const transformedTask = transformTaskFromAPI(createdTask);
      setTasks([...tasks, transformedTask]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date().toISOString().split('T')[0],
        assignee: '',
        tags: []
      });
      setIsAddTaskOpen(false);
    } catch (err: any) {
      alert('Failed to create task: ' + (err.message || 'Unknown error'));
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(parseInt(taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err: any) {
      alert('Failed to delete task: ' + (err.message || 'Unknown error'));
    }
  };

  // Edit task
  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    try {
      const apiData = transformTaskToAPI(editingTask);
      const updatedTask = await updateTask(parseInt(editingTask.id), apiData);

      const transformedTask = transformTaskFromAPI(updatedTask);
      setTasks(tasks.map(t => t.id === editingTask.id ? transformedTask : t));
      setIsEditTaskOpen(false);
      setEditingTask(null);
    } catch (err: any) {
      alert('Failed to update task: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center max-w-md">
            <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Tasks</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when loaded */}
      {!isLoading && !error && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-500">Manage your team's tasks efficiently</p>
            </div>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Task
            </button>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Tasks</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FiFilter className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[calc(100vh-16rem)]">
              {tasksByStatus.map((statusGroup) => (
                <div key={statusGroup.id} className="bg-white rounded-lg shadow flex flex-col max-h-full">
                  <div className={`${statusGroup.color} px-4 py-2 rounded-t-lg flex items-center flex-shrink-0`}>
                    <h3 className="font-medium text-gray-800">{statusGroup.name}</h3>
                    <span className="ml-2 bg-white bg-opacity-30 rounded-full px-2 py-0.5 text-xs font-semibold">
                      {statusGroup.items.length}
                    </span>
                  </div>
                  <Droppable droppableId={statusGroup.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-4 min-h-[200px] max-h-[calc(100vh-20rem)] overflow-y-auto flex-1"
                      >
                        <AnimatePresence>
                          {statusGroup.items.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <DraggableItem
                                  provided={provided}
                                  snapshot={snapshot}
                                  className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                    <div className="flex space-x-1">
                                      <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={() => {
                                          setEditingTask(task);
                                          setIsEditTaskOpen(true);
                                        }}
                                      >
                                        <FiEdit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        className="text-gray-400 hover:text-red-500"
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <FiTrash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center">
                                      <FiCalendar className="mr-1 h-3.5 w-3.5" />
                                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </div>
                                  </div>

                                  {task.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {task.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex -space-x-1">
                                      <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-medium text-indigo-800">
                                        {task.assignee.split(' ').map(n => n[0]).join('')}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {task.status === 'completed' ? (
                                        <span className="flex items-center text-green-600">
                                          <FiCheck className="mr-1 h-3.5 w-3.5" /> Completed
                                        </span>
                                      ) : (
                                        <span className="flex items-center">
                                          <FiClock className="mr-1 h-3.5 w-3.5" />
                                          {task.status === 'in-progress' ? 'In Progress' :
                                            task.status === 'review' ? 'In Review' : 'To Do'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </DraggableItem>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}

                        {statusGroup.items.length === 0 && (
                          <div className="text-center py-4 text-sm text-gray-500">
                            No tasks in this column
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newTask.status}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Status })}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                      Assignee
                    </label>
                    <input
                      type="text"
                      id="assignee"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      placeholder="Enter assignee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {newTask.tags.map((tag, index) => (
                        <div key={index} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-indigo-500 hover:text-indigo-700"
                            onClick={() => {
                              const newTags = [...newTask.tags];
                              newTags.splice(index, 1);
                              setNewTask({ ...newTask, tags: newTags });
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        className="flex-1 min-w-[100px] border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add a tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            setNewTask({
                              ...newTask,
                              tags: [...newTask.tags, e.currentTarget.value.trim()]
                            });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsAddTaskOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {isEditTaskOpen && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Edit Task</h3>
              </div>
              <form onSubmit={handleEditTask}>
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTask.description}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="edit-status"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={editingTask.status}
                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Status })}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="edit-priority"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="edit-dueDate"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      setIsEditTaskOpen(false);
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;
