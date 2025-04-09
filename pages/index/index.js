// index.js
Page({
  data: {
    // 计时器状态
    timerStatus: 'idle', // idle, running, paused
    currentMode: 'work', // work, shortBreak, longBreak
    
    // 时间设置（分钟）
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    
    // 当前时间（秒）
    currentTime: 25 * 60,
    
    // 显示格式
    displayMinutes: '25',
    displaySeconds: '00',
    
    // 进度条
    progress: 0,
    
    // 番茄计数
    completedPomodoros: 0,
    pomodoroTarget: 4,
    
    // 当前任务
    currentTask: null,
    
    // 是否显示任务列表选择器
    showTaskSelector: false,
    
    // 任务列表示例数据
    tasks: [],
    
    // 上次设置更新时间戳
    lastSettingsUpdate: 0
  },

  onLoad() {
    // 初始化，从本地存储加载任务和设置
    const tasks = wx.getStorageSync('tasks') || [];
    const settings = wx.getStorageSync('settings') || {};
    const lastSettingsUpdate = wx.getStorageSync('_settingsUpdatedTimestamp') || 0;
    
    // 更新默认设置
    if (settings.workTime) {
      this.setData({
        workTime: settings.workTime,
        shortBreakTime: settings.shortBreakTime || 5,
        longBreakTime: settings.longBreakTime || 15,
        currentTime: settings.workTime * 60,
        displayMinutes: String(settings.workTime).padStart(2, '0'),
        lastSettingsUpdate
      });
    }
    
    this.setData({ tasks });
    
    // 获取今日的番茄钟完成情况
    const today = new Date().toISOString().split('T')[0];
    const stats = wx.getStorageSync('stats') || {};
    const todayStats = stats[today] || { completed: 0 };
    
    this.setData({
      completedPomodoros: todayStats.completed
    });
  },
  
  // 每次页面显示时执行
  onShow() {
    // 重新加载设置
    const settings = wx.getStorageSync('settings') || {};
    const currentSettingsUpdate = wx.getStorageSync('_settingsUpdatedTimestamp') || 0;
    
    // 检查设置是否已被更新（通过时间戳比较）
    const settingsUpdated = currentSettingsUpdate > this.data.lastSettingsUpdate;
    
    if (settings.workTime) {
      // 获取当前正在运行的模式
      const { currentMode, timerStatus } = this.data;
      
      // 更新设置值
      this.setData({
        workTime: settings.workTime,
        shortBreakTime: settings.shortBreakTime || 5,
        longBreakTime: settings.longBreakTime || 15,
        lastSettingsUpdate: currentSettingsUpdate
      });
      
      // 如果设置已更新或计时器未运行，则更新当前显示的时间
      if (settingsUpdated || timerStatus !== 'running') {
        console.log('Settings updated, applying new timer settings...');
        
        // 如果设置刚刚被更新且计时器未运行，立即重置计时器
        if (settingsUpdated && timerStatus !== 'running') {
          this.resetTimer();
        } 
        // 如果设置被更新但计时器正在运行，提示用户
        else if (settingsUpdated && timerStatus === 'running') {
          wx.showToast({
            title: '新设置将在计时结束后生效',
            icon: 'none',
            duration: 2000
          });
        }
        // 如果只是普通的页面显示且计时器未运行，正常更新显示
        else if (timerStatus !== 'running') {
          // 根据当前模式设置正确的时间
          let minutes;
          if (currentMode === 'work') {
            minutes = settings.workTime;
          } else if (currentMode === 'shortBreak') {
            minutes = settings.shortBreakTime || 5;
          } else if (currentMode === 'longBreak') {
            minutes = settings.longBreakTime || 15;
          }
          
          // 更新显示时间
          this.setData({
            currentTime: minutes * 60,
            displayMinutes: String(minutes).padStart(2, '0'),
            displaySeconds: '00'
          });
        }
      }
    }
    
    // 重新加载任务
    const tasks = wx.getStorageSync('tasks') || [];
    this.setData({ tasks });
  },
  
  // 从设置页面直接更新计时器设置
  updateTimerSettings() {
    // 读取最新设置
    const settings = wx.getStorageSync('settings') || {};
    
    if (!settings.workTime) return;
    
    // 获取当前正在运行的模式
    const { currentMode, timerStatus } = this.data;
    
    // 更新设置值
    this.setData({
      workTime: settings.workTime,
      shortBreakTime: settings.shortBreakTime || 5,
      longBreakTime: settings.longBreakTime || 15
    });
    
    // 如果计时器未运行，则更新当前显示的时间并立即重置计时器
    if (timerStatus !== 'running') {
      this.resetTimer();
    } else {
      // 如果计时器正在运行，显示提示
      wx.showToast({
        title: '计时结束后生效',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 开始计时器
  startTimer() {
    if (this.data.timerStatus === 'running') return;
    
    this.setData({
      timerStatus: 'running'
    });
    
    // 记录开始时间
    this.startTime = new Date().getTime();
    this.expectedEndTime = this.startTime + (this.data.currentTime * 1000);
    
    // 启动计时器
    this.timer = setInterval(() => this.updateTimer(), 100);
  },
  
  // 暂停计时器
  pauseTimer() {
    if (this.data.timerStatus !== 'running') return;
    
    clearInterval(this.timer);
    this.setData({
      timerStatus: 'paused'
    });
    
    // 保存剩余时间
    this.remainingTime = this.data.currentTime;
  },
  
  // 重置计时器
  resetTimer() {
    clearInterval(this.timer);
    
    // 根据当前模式设置时间
    let minutes = this.data.workTime;
    if (this.data.currentMode === 'shortBreak') minutes = this.data.shortBreakTime;
    if (this.data.currentMode === 'longBreak') minutes = this.data.longBreakTime;
    
    this.setData({
      timerStatus: 'idle',
      currentTime: minutes * 60,
      displayMinutes: String(minutes).padStart(2, '0'),
      displaySeconds: '00',
      progress: 0
    });
  },
  
  // 更新计时器
  updateTimer() {
    const now = new Date().getTime();
    const remainingTime = Math.ceil((this.expectedEndTime - now) / 1000);
    
    if (remainingTime <= 0) {
      // 计时结束
      this.handleTimerComplete();
      return;
    }
    
    // 计算并更新分钟和秒
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    // 计算进度
    let totalTime;
    switch (this.data.currentMode) {
      case 'work':
        totalTime = this.data.workTime * 60;
        break;
      case 'shortBreak':
        totalTime = this.data.shortBreakTime * 60;
        break;
      case 'longBreak':
        totalTime = this.data.longBreakTime * 60;
        break;
    }
    
    const progress = 1 - (remainingTime / totalTime);
    
    this.setData({
      currentTime: remainingTime,
      displayMinutes: String(minutes).padStart(2, '0'),
      displaySeconds: String(seconds).padStart(2, '0'),
      progress: progress
    });
  },
  
  // 计时器结束处理
  handleTimerComplete() {
    clearInterval(this.timer);
    
    // 播放提示音
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = '/assets/sounds/complete.mp3';
    innerAudioContext.play();
    
    // 震动提示
    wx.vibrateShort();
    
    // 根据当前模式切换到下一个模式
    if (this.data.currentMode === 'work') {
      // 完成一个番茄
      const completedPomodoros = this.data.completedPomodoros + 1;
      this.setData({ completedPomodoros });
      
      // 存储统计数据
      this.saveStats();
      
      // 更新当前任务的番茄数
      if (this.data.currentTask) {
        this.updateTaskPomodoro();
      }
      
      // 判断是短休息还是长休息
      if (completedPomodoros % this.data.pomodoroTarget === 0) {
        this.switchMode('longBreak');
      } else {
        this.switchMode('shortBreak');
      }
    } else {
      // 休息结束，回到工作模式
      this.switchMode('work');
    }
    
    // 显示完成提示
    wx.showToast({
      title: this.data.currentMode === 'work' ? '工作时间结束!' : '休息时间结束!',
      icon: 'success',
      duration: 2000
    });
  },
  
  // 切换模式
  switchMode(mode) {
    // 检查是通过点击界面切换模式还是函数调用
    if (typeof mode === 'object') {
      // 如果是事件对象，则从dataset中获取mode
      mode = mode.currentTarget.dataset.mode;
    }
    
    let minutes;
    switch (mode) {
      case 'work':
        minutes = this.data.workTime;
        break;
      case 'shortBreak':
        minutes = this.data.shortBreakTime;
        break;
      case 'longBreak':
        minutes = this.data.longBreakTime;
        break;
    }
    
    this.setData({
      currentMode: mode,
      timerStatus: 'idle',
      currentTime: minutes * 60,
      displayMinutes: String(minutes).padStart(2, '0'),
      displaySeconds: '00',
      progress: 0
    });
  },
  
  // 保存统计数据
  saveStats() {
    const today = new Date().toISOString().split('T')[0];
    const stats = wx.getStorageSync('stats') || {};
    
    if (!stats[today]) {
      stats[today] = {
        completed: 0,
        totalWorkTime: 0
      };
    }
    
    stats[today].completed = this.data.completedPomodoros;
    stats[today].totalWorkTime += this.data.workTime;
    
    wx.setStorageSync('stats', stats);
  },
  
  // 更新任务的番茄完成数
  updateTaskPomodoro() {
    const { tasks, currentTask } = this.data;
    const taskIndex = tasks.findIndex(t => t.id === currentTask.id);
    
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].completedPomodoros += 1;
      
      // 如果完成了预估的所有番茄钟，标记任务为完成
      if (updatedTasks[taskIndex].completedPomodoros >= updatedTasks[taskIndex].estimatedPomodoros) {
        updatedTasks[taskIndex].completed = true;
      }
      
      this.setData({ tasks: updatedTasks });
      wx.setStorageSync('tasks', updatedTasks);
    }
  },
  
  // 切换任务选择器
  toggleTaskSelector() {
    this.setData({
      showTaskSelector: !this.data.showTaskSelector
    });
  },
  
  // 选择任务
  selectTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const selectedTask = this.data.tasks.find(task => task.id === taskId);
    
    this.setData({
      currentTask: selectedTask,
      showTaskSelector: false
    });
  },
  
  // 导航到任务页面
  navigateToTasks() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  }
})
