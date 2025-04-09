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
      dayData.push((stats[dateStr] && stats[dateStr].completed) || 0);
    }
    
    this.setData({ dayLabels, dayData });
  },
  
  // 生成周数据
  generateWeekData() {
    // 这里简化处理，使用随机数据
    const weekLabels = ['第1周', '第2周', '第3周', '第4周'];
    const weekData = [
      Math.floor(Math.random() * 20 + 5),
      Math.floor(Math.random() * 20 + 5),
      Math.floor(Math.random() * 20 + 5),
      Math.floor(Math.random() * 20 + 5)
    ];
    
    this.setData({ weekLabels, weekData });
  },
  
  // 生成月数据
  generateMonthData() {
    // 这里简化处理，使用随机数据
    const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const monthData = [
      Math.floor(Math.random() * 50 + 10),
      Math.floor(Math.random() * 50 + 10),
      Math.floor(Math.random() * 50 + 10),
      Math.floor(Math.random() * 50 + 10),
      Math.floor(Math.random() * 50 + 10),
      Math.floor(Math.random() * 50 + 10)
    ];
    
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