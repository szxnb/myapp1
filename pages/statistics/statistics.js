// pages/statistics/statistics.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stats: {},
    currentView: 'day', // day, week, month
    totalPomodoros: 0,
    totalWorkTime: 0,
    avgPomodorosPerDay: 0,
    dayLabels: [],
    dayData: [],
    weekLabels: [],
    weekData: [],
    monthLabels: [],
    monthData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadStats();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时重新加载统计数据
    this.loadStats();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 加载统计数据
  loadStats() {
    const stats = wx.getStorageSync('stats') || {};
    
    this.setData({ stats });
    this.calculateStats();
    this.generateChartData();
  },
  
  // 计算统计指标
  calculateStats() {
    const { stats } = this.data;
    let totalPomodoros = 0;
    let totalWorkTime = 0;
    
    // 计算总数
    Object.values(stats).forEach(day => {
      totalPomodoros += day.completed || 0;
      totalWorkTime += day.totalWorkTime || 0;
    });
    
    // 计算每日平均
    const daysCount = Object.keys(stats).length || 1;
    const avgPomodorosPerDay = totalPomodoros / daysCount;
    
    this.setData({
      totalPomodoros,
      totalWorkTime,
      avgPomodorosPerDay: parseFloat(avgPomodorosPerDay.toFixed(1))
    });
  },
  
  // 生成图表数据
  generateChartData() {
    this.generateDayData();
    this.generateWeekData();
    this.generateMonthData();
  },
  
  // 生成日数据
  generateDayData() {
    const { stats } = this.data;
    const dayLabels = [];
    const dayData = [];
    
    // 获取过去7天的日期
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = this.formatDate(date);
      
      dayLabels.push(this.formatDateLabel(date));
      const completedCount = (stats[dateStr] && stats[dateStr].completed) || 0;
      dayData.push(completedCount);
    }
    
    this.setData({ dayLabels, dayData });
  },
  
  // 生成周数据
  generateWeekData() {
    const { stats } = this.data;
    const weekLabels = [];
    const weekData = [];
    
    // 获取当前日期
    const today = new Date();
    
    // 计算当前周的起始日期
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay() || 7; // 如果是周日(0)，转为7
    currentWeekStart.setDate(today.getDate() - dayOfWeek + 1); // 设置为本周的周一
    
    // 获取过去4周的数据
    for (let i = 3; i >= 0; i--) {
      // 计算每周的开始日期（周一）
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (i * 7));
      
      // 计算周结束日期（周日）
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // 周标签
      const weekLabel = `${this.formatDateLabel(weekStart)}-${this.formatDateLabel(weekEnd)}`;
      weekLabels.push(weekLabel);
      
      // 计算这一周的总番茄数
      let weekTotal = 0;
      
      // 计算周内每天的番茄数
      for (let j = 0; j < 7; j++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + j);
        const dateStr = this.formatDate(date);
        
        weekTotal += (stats[dateStr] && stats[dateStr].completed) || 0;
      }
      
      weekData.push(weekTotal);
    }
    
    this.setData({ weekLabels, weekData });
  },
  
  // 生成月数据
  generateMonthData() {
    const { stats } = this.data;
    const monthLabels = [];
    const monthData = [];
    
    // 获取当前日期
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 获取过去6个月的数据
    for (let i = 5; i >= 0; i--) {
      // 计算月份和年份
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      // 月标签
      const monthLabel = `${month + 1}月`;
      monthLabels.push(monthLabel);
      
      // 计算这个月的总番茄数
      let monthTotal = 0;
      
      // 遍历所有记录，找出属于这个月的记录
      Object.keys(stats).forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          monthTotal += stats[dateStr].completed || 0;
        }
      });
      
      monthData.push(monthTotal);
    }
    
    this.setData({ monthLabels, monthData });
  },
  
  // 切换视图
  switchView(e) {
    const view = e.currentTarget.dataset.view;
    this.setData({ currentView: view });
  },
  
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  // 格式化日期标签
  formatDateLabel(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${month}/${day}`;
  }
})