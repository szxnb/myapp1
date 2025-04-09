// pages/settings/settings.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 时间设置（分钟）
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    
    // 声音设置
    soundEnabled: true,
    vibrationEnabled: true,
    
    // 主题设置
    darkMode: false,
    
    // 重置确认
    showResetConfirm: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载用户设置
    const settings = wx.getStorageSync('settings') || {};
    
    // 设置默认值
    this.setData({
      workTime: settings.workTime || 25,
      shortBreakTime: settings.shortBreakTime || 5,
      longBreakTime: settings.longBreakTime || 15,
      soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
      vibrationEnabled: settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true,
      darkMode: settings.darkMode || false
    });
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

  // 更新工作时间
  onWorkTimeChange(e) {
    this.setData({
      workTime: Number(e.detail.value)
    });
    this.saveSettings();
  },
  
  // 更新短休息时间
  onShortBreakTimeChange(e) {
    this.setData({
      shortBreakTime: Number(e.detail.value)
    });
    this.saveSettings();
  },
  
  // 更新长休息时间
  onLongBreakTimeChange(e) {
    this.setData({
      longBreakTime: Number(e.detail.value)
    });
    this.saveSettings();
  },
  
  // 切换声音开关
  toggleSound() {
    this.setData({
      soundEnabled: !this.data.soundEnabled
    });
    this.saveSettings();
  },
  
  // 切换震动开关
  toggleVibration() {
    this.setData({
      vibrationEnabled: !this.data.vibrationEnabled
    });
    this.saveSettings();
  },
  
  // 切换深色模式
  toggleDarkMode() {
    this.setData({
      darkMode: !this.data.darkMode
    });
    this.saveSettings();
    
    // 应用深色模式（这里需要全局设置）
    if (this.data.darkMode) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#333333'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      });
    }
  },
  
  // 保存设置到本地
  saveSettings() {
    const { workTime, shortBreakTime, longBreakTime, soundEnabled, vibrationEnabled, darkMode } = this.data;
    
    wx.setStorageSync('settings', {
      workTime,
      shortBreakTime,
      longBreakTime,
      soundEnabled,
      vibrationEnabled,
      darkMode
    });
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1000
    });
  },
  
  // 显示重置确认对话框
  showResetConfirmDialog() {
    this.setData({
      showResetConfirm: true
    });
  },
  
  // 隐藏重置确认对话框
  hideResetConfirmDialog() {
    this.setData({
      showResetConfirm: false
    });
  },
  
  // 重置所有数据
  resetAllData() {
    // 清除所有本地存储数据
    wx.clearStorageSync();
    
    // 重置设置为默认值
    this.setData({
      workTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      soundEnabled: true,
      vibrationEnabled: true,
      darkMode: false,
      showResetConfirm: false
    });
    
    wx.showToast({
      title: '已重置所有数据',
      icon: 'success',
      duration: 1500
    });
    
    // 保存默认设置
    this.saveSettings();
  },
  
  // 关于页面
  navigateToAbout() {
    wx.showModal({
      title: '关于番茄时钟',
      content: '番茄时钟是一个基于番茄工作法的时间管理应用，帮助您提高工作效率和专注度。\n\n版本: 1.0.0\n\n开发者: YOUR_NAME',
      showCancel: false,
      confirmText: '确定'
    });
  }
})