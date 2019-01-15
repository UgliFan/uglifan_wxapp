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
                label: '帮助'
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
    tapHandler: function(e) {
        var data = e.currentTarget.dataset.item;
        console.log(data);
        if (data.key === 'category') {
            wx.navigateTo({
                url: '/pages/categories/categories'
            })
        }
    }
});