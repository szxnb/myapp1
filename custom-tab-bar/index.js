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
      
      // 立即更新选中状态
      this.setData({
        selected: data.index
      });
      
      // 切换到相应页面
      wx.switchTab({
        url
      });
    }
  }
}) 