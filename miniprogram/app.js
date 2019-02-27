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
        wx.checkSession({
            success: () => {
                try {
                    const value = wx.getStorageSync('openId')
                    if (openId) {
                        this.globalData.openId = openId;
                    }
                } catch(e) {
                    try {
                        wx.setStorageSync('openId', '')
                    } catch (e) {}
                    this.login()
                }
            },
            fail: () => {
                this.login()
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
    },
    login() {
        wx.login({
            success: loginInfo => {
                wx.request({
                    url: 'https://www.uglifan.cn/api/wx/openid',
                    data: {
                        js_code: loginInfo.code
                    },
                    method: 'GET',
                    success: res => {
                        if (res.data && res.data.code === 0) {
                            let result = res.data.result || {};
                            if (result.openid) {
                                this.globalData.openId = result.openid;
                                try {
                                    wx.setStorageSync('openId', result.openid)
                                } catch(e) {}
                            }
                        }
                    }
                })
            }
        })
    }
})
