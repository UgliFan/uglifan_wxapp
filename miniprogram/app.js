//app.js
App({
    globalData: {},
    onLaunch() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true,
            })
        }
        wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
                this.globalData.hasLocPerm = true;
            }
        })
        wx.getSystemInfo({
            success: res => {
                res.isX = res.model.toLowerCase().indexOf('iphone x') > -1
                this.globalData.sysInfo = res;
            }
        })
    }
})
