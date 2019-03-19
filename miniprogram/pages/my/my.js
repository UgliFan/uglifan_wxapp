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
            key: 'in',
            title: '我的总收入'
        }, {
            key: 'out',
            title: '我的总支出'
        }, {
            key: 'minus',
            title: '我的收支平衡'
        }],
        sum: {
            'in': '0.00',
            out: '0.00',
            minus: '0.00'
        },
        navHeight: 64
    },
    onLoad() {
        const nav = app.globalData.nav
        this.setData({
            navHeight: nav.paddingTop + nav.height
        })
        this.getMyCount()
    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                current: 3,
                centerAvaliable: false
            })
        }
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
            app.checkLogin()
        }
    },
    getMyCount() {
        if (app.globalData.openId) {
            wx.request({
                url: 'https://uglifan.cn/api/common/allcount',
                data: {
                    id: app.globalData.openId
                },
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0 && res.result) {
                        let inCount = res.result.inCount || 0;
                        let outCount = res.result.outCount || 0;
                        let minus = inCount - outCount;
                        this.setData({
                            sum: {
                                'in': (inCount / 100).toFixed(2),
                                out: (outCount / 100).toFixed(2),
                                minus: (minus / 100).toFixed(2)
                            }
                        });
                    }
                }
            })
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