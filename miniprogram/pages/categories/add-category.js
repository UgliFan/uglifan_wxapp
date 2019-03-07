const app = getApp()
const iconList = require('../../icons.js')
Page({
    data: {
        iconSelect: '',
        inputValue: '',
        type: null,
        iconList: [],
        navHeight: 64
    },
    onLoad (options) {
        const nav = app.globalData.nav
        this.setData({
            iconSelect: iconList[0].className,
            iconList: iconList,
            type: Number(options.type),
            navHeight: nav.paddingTop + nav.height
        });
    },
    selectIcon(e) {
        let item = e.currentTarget.dataset.item;
        if (item.className !== this.data.iconSelect) {
            this.setData({
                iconSelect: item.className
            });
        }
    },
    bindKeyInput(e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
    saveCategory() {
        if (this.data.inputValue && this.data.iconSelect) {
            let params = {
                icon: this.data.iconSelect,
                name: this.data.inputValue,
                type: this.data.type,
                remark: ''
            };
            wx.request({
                url: 'https://uglifan.cn/api/category/create',
                data: params,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        wx.navigateBack({
                            delta: 1
                        });
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: res.message || '未知错误'
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: err.message || '未知错误.'
                    })
                }
            })
        } else {
            wx.showToast({
                icon: 'none',
                title: '请输入类别名称'
            })
        }
    }
})