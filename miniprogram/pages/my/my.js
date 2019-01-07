Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        isLogin: false
    },
    onLoad: function () {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            this.setData({
                                isLogin: true,
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo
                            })
                        }
                    })
                }
            }
        })
    },
    onGetUserInfo: function (e) {
        if (!this.isLogin && e.detail.userInfo) {
            this.setData({
                isLogin: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
        }
    },
});