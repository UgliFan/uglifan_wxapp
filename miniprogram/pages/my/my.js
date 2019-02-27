const app = getApp()
Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        isLogin: false,
        fnGroup: [{
            list: [{
                key: 'category',
                label: '类别设置'
            }, {
                key: 'pay',
                label: '给亲爱的打钱'
            }]
        }, {
            list: [{
                key: 'help',
                label: '新世界的大门（个人小程序不支持，哎）'
            }]
        }],
        sumArray: [{
            key: 'all',
            title: '总记账笔数'
        }, {
            key: 'my',
            title: '我的记账笔数'
        }, {
            key: 'other',
            title: 'TA的记账笔数'
        }],
        sum: {
            all: 0,
            my: 0,
            other: 0
        }
    },
    onShow() {
        // 获取用户信息
        let userInfo = app.globalData.userInfo;
        this.setData({
            isLogin: app.globalData.isLogin,
            avatarUrl: userInfo.avatarUrl || './user-unlogin.png',
            userInfo: userInfo
        })
    },
    onPullDownRefresh() {
        wx.stopPullDownRefresh()
    },
    onGetUserInfo(e) {
        if (!this.isLogin && e.detail.userInfo) {
            this.setData({
                isLogin: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
            app.checkLogin();
        }
    },
    tapHandler(e) {
        var data = e.currentTarget.dataset.item;
        if (data.key === 'category') {
            wx.navigateTo({
                url: '/pages/categories/categories'
            })
        } else if (data.key === 'help') {
            wx.navigateTo({
                url: '/pages/webview/webview'
            })
        }
    }
});