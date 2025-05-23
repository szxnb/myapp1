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
    showResetConfirm: false,
    
    // 设置是否已修改（避免频繁保存相同设置）
    settingsModified: false
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
      darkMode: settings.darkMode || false,
      settingsModified: false
    });
    
    // 应用当前的深色模式设置
    this.applyDarkModeSettings();
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
      workTime: Number(e.detail.value),
      settingsModified: true
    });
  },
  
  // 更新短休息时间
  onShortBreakTimeChange(e) {
    this.setData({
      shortBreakTime: Number(e.detail.value),
      settingsModified: true
    });
  },
  
  // 更新长休息时间
  onLongBreakTimeChange(e) {
    this.setData({
      longBreakTime: Number(e.detail.value),
      settingsModified: true
    });
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
    }, () => {
      this.saveSettings();
      this.applyDarkModeSettings();
    });
  },
  
  // 应用深色模式设置
  applyDarkModeSettings() {
    const { darkMode } = this.data;
    
    // 设置导航栏颜色
    wx.setNavigationBarColor({
      frontColor: darkMode ? '#ffffff' : '#000000',
      backgroundColor: darkMode ? '#333333' : '#ffffff',
      animation: {
        duration: 300,
        timingFunc: 'easeIn'
      }
    });
    
    // 设置页面整体样式
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (darkMode) {
      // 为页面添加深色模式类
      currentPage.selectAllComponents('.container').forEach(component => {
        component.setData({
          darkMode: true
        });
      });
    } else {
      // 移除页面深色模式类
      currentPage.selectAllComponents('.container').forEach(component => {
        component.setData({
          darkMode: false
        });
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
    
    this.setData({
      settingsModified: false
    });
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1000
    });
  },
  
  // 保存并立即应用时间设置（用于保存按钮）
  saveAndApplySettings() {
    // 如果设置没有修改，无需保存
    if (!this.data.settingsModified) {
      wx.showToast({
        title: '无设置变更',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    
    // 先保存设置
    this.saveSettings();
    
    // 标记需要强制刷新计时器
    wx.setStorageSync('_settingsUpdatedTimestamp', new Date().getTime());
    
    // 显示成功提示
    wx.showToast({
      title: '设置已应用',
      icon: 'success',
      duration: 1500
    });
    
    // 返回到首页并强制刷新
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }, 1000);
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
      showResetConfirm: false,
      settingsModified: true
    });
    
    // 应用默认的深色模式设置（关闭）
    this.applyDarkModeSettings();
    
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