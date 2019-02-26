//app.js
App({
    globalData: {},
    onLaunch() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true
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
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            this.globalData.isLogin = true;
                            this.globalData.userInfo = res.userInfo;
                        }
                    })
                }
            }
        })
    }
})
