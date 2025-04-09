Page({
  data: {
    tasks: [],
    newTaskTitle: '',
    newTaskEstimatedPomodoros: 1,
    newTaskPriority: 'medium', // 'low', 'medium', 'high'
    showAddTaskForm: false,
    editingTaskId: null,
    completedTasksCount: 0,
    filters: {
      all: true,
      active: false,
      completed: false
    }
  },

  onLoad() {
    // 添加一个示例任务，方便调试
    const initialTask = {
      id: 'initial-task',
      title: '示例任务',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    
    // 检查是否已经有任务
    const existingTasks = wx.getStorageSync('tasks');
    if (!existingTasks || existingTasks.length === 0) {
      wx.setStorageSync('tasks', [initialTask]);
    }
    
    this.loadTasks();
  },
  
  onShow() {
    // 每次页面显示时重新加载任务
    this.loadTasks();
  },
  
  // 加载任务
  loadTasks() {
    const tasks = wx.getStorageSync('tasks') || [];
    const completedTasksCount = tasks.filter(task => task.completed).length;
    
    this.setData({ 
      tasks,
      completedTasksCount
    });
  },
  
  // 显示/隐藏添加任务表单
  toggleAddTaskForm() {
    this.setData({
      showAddTaskForm: !this.data.showAddTaskForm,
      newTaskTitle: '',
      newTaskEstimatedPomodoros: 1,
      newTaskPriority: 'medium',
      editingTaskId: null
    });
  },
  
  // 更新新任务标题
  onNewTaskTitleInput(e) {
    this.setData({
      newTaskTitle: e.detail.value
    });
  },
  
  // 更新预估番茄数
  onEstimatedPomodorosChange(e) {
    this.setData({
      newTaskEstimatedPomodoros: Number(e.detail.value)
    });
  },
  
  // 更新任务优先级
  setTaskPriority(e) {
    const priority = e.currentTarget.dataset.priority;
    this.setData({
      newTaskPriority: priority
    });
  },
  
  // 添加/更新任务
  submitTask() {
    const { newTaskTitle, newTaskEstimatedPomodoros, newTaskPriority, editingTaskId, tasks } = this.data;
    
    if (!newTaskTitle.trim()) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none'
      });
      return;
    }
    
    let updatedTasks = [];
    
    if (editingTaskId) {
      // 更新现有任务
      updatedTasks = tasks.map(task => {
        if (task.id === editingTaskId) {
          return {
            ...task,
            title: newTaskTitle,
            estimatedPomodoros: newTaskEstimatedPomodoros,
            priority: newTaskPriority
          };
        }
        return task;
      });
      
      wx.showToast({
        title: '任务已更新',
        icon: 'success'
      });
    } else {
      // 添加新任务
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle,
        estimatedPomodoros: newTaskEstimatedPomodoros,
        completedPomodoros: 0,
        completed: false,
        priority: newTaskPriority,
        createdAt: new Date().toISOString()
      };
      
      updatedTasks = [...tasks, newTask];
      
      wx.showToast({
        title: '任务已添加',
        icon: 'success'
      });
    }
    
    const completedTasksCount = updatedTasks.filter(task => task.completed).length;
    
    this.setData({ 
      tasks: updatedTasks,
      completedTasksCount
    });
    wx.setStorageSync('tasks', updatedTasks);
    
    this.toggleAddTaskForm();
  },
  
  // 编辑任务
  editTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (task) {
      this.setData({
        showAddTaskForm: true,
        newTaskTitle: task.title,
        newTaskEstimatedPomodoros: task.estimatedPomodoros,
        newTaskPriority: task.priority || 'medium',
        editingTaskId: taskId
      });
    }
  },
  
  // 删除任务
  deleteTask(e) {
    const taskId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedTasks = this.data.tasks.filter(task => task.id !== taskId);
          const completedTasksCount = updatedTasks.filter(task => task.completed).length;
          
          this.setData({ 
            tasks: updatedTasks,
            completedTasksCount
          });
          wx.setStorageSync('tasks', updatedTasks);
          
          wx.showToast({
            title: '任务已删除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 切换任务完成状态
  toggleTaskCompleted(e) {
    const taskId = e.currentTarget.dataset.id;
    const updatedTasks = this.data.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed
        };
      }
      return task;
    });
    
    const completedTasksCount = updatedTasks.filter(task => task.completed).length;
    
    this.setData({ 
      tasks: updatedTasks,
      completedTasksCount
    });
    wx.setStorageSync('tasks', updatedTasks);
    
    // 显示状态变更提示
    const task = updatedTasks.find(t => t.id === taskId);
    wx.showToast({
      title: task.completed ? '任务已完成' : '任务已恢复',
      icon: 'success'
    });
  },
  
  // 切换任务过滤器
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    
    this.setData({
      filters: {
        all: filter === 'all',
        active: filter === 'active',
        completed: filter === 'completed'
      }
    });
  },
  
  // 获取任务类别的样式类
  getTaskPriorityClass(priority) {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  },
  
  // 清除已完成的任务
  clearCompletedTasks() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有已完成的任务吗？',
      success: (res) => {
        if (res.confirm) {
          const activeTasks = this.data.tasks.filter(task => !task.completed);
          
          this.setData({ 
            tasks: activeTasks,
            completedTasksCount: 0
          });
          wx.setStorageSync('tasks', activeTasks);
          
          wx.showToast({
            title: '已清除完成任务',
            icon: 'success'
          });
        }
      }
    });
  }
}) 