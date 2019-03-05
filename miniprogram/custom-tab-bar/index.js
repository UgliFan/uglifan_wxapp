const app = getApp()

Component({
    options: {
        addGlobalClass: true
    },
    properties: {

    },
    data: {
        centerClicked: false,
        centerAvaliable: false,
        current: 0,
        tabBar: [{
            pagePath: '/pages/home/home',
            icon: 'ufi-home',
            text: '首页'
        }, {
            pagePath: '/pages/charts/charts',
            icon: 'ufi-rank',
            text: '图表'
        }, {
            pagePath: '/pages/photo/photo',
            icon: 'ufi-pic',
            text: '照片墙'
        }, {
            pagePath: '/pages/my/my',
            icon: 'ufi-my',
            text: '我的'
        }],
        isX: false
    },
    lifetimes: {
        attached() {
            this.setData({
                isX: app.globalData.sysInfo.isX
            });
        }
    },
    methods: {
        selectTab(e) {
            let url = e.currentTarget.dataset.item.pagePath;
            wx.switchTab({ url })
        },
        centerClick(e) {
            if (this.data.centerAvaliable) {
                const pages = getCurrentPages()
                const currentPage = pages[pages.length - 1]
                currentPage.centerClick && currentPage.centerClick(e)
            }
        },
        centerLongPress(e) {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            currentPage.centerLongPress && currentPage.centerLongPress(e)
        }
    }
})
