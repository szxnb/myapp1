Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#E8593E",
    list: [{
      pagePath: "/pages/index/index",
      text: "计时器"
    }, {
      pagePath: "/pages/tasks/tasks",
      text: "任务"
    }, {
      pagePath: "/pages/statistics/statistics",
      text: "统计"
    }, {
      pagePath: "/pages/settings/settings",
      text: "设置"
    }]
  },
  lifetimes: {
    attached() {
      this.setSelectedByPath();
    }
  },
  pageLifetimes: {
    show() {
      this.setSelectedByPath();
    }
  },
  methods: {
    setSelectedByPath() {
      // 获取当前页面路径，设置选中状态
      const pages = getCurrentPages();
      if (!pages.length) return;
      
      const currentPage = pages[pages.length - 1];
      const url = '/' + currentPage.route;
      
      const list = this.data.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].pagePath === url) {
          this.setData({
            selected: i
          });
          break;
        }
      }
    },
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;
      
      // 立即更新选中状态
      this.setData({
        selected: index
      });
      
      console.log('Switching to tab:', url, 'index:', index);
      
      // 切换到相应页面
      try {
        wx.switchTab({
          url,
          fail: (err) => {
            console.error('Failed to switch tab:', err);
            // 尝试使用navigateTo作为备选方案
            wx.navigateTo({
              url,
              fail: (navigateErr) => {
                console.error('Failed to navigate:', navigateErr);
                // 最后尝试使用重定向
                wx.redirectTo({
                  url,
                  fail: (redirectErr) => {
                    console.error('Failed to redirect:', redirectErr);
                  }
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('Error during tab switching:', error);
      }
    }
  }
}) 