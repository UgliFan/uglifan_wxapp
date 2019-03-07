const app = getApp()
Page({
    data: {
        categoryTypes: [{
            value: 0,
            label: '支出'
        }, {
            value: 1,
            label: '收入'
        }],
        current: 0,
        categories: {},
        navHeight: 64
    },
    onLoad() {
        const nav = app.globalData.nav
        this.setData({
            navHeight: nav.paddingTop + nav.height
        });
    },
    onShow() {
        this.onQuery();
    },
    onQuery() {
        wx.request({
            url: 'https://uglifan.cn/api/category/list',
            data: {
                type: this.data.categoryTypes[this.data.current].value
            },
            method: 'GET',
            success: response => {
                let res = response.statusCode === 200 && response.data ? response.data : {};
                if (res.code === 0) {
                    this.setData({
                        categories: res.result || []
                    })
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
                    title: err.message || '未知错误'
                })
            }
        })
    },
    tabSelect(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            current: index
        });
        this.onQuery();
    },
    beforeDel(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        item.showDel = true;
        let list = this.data.categories.slice();
        list.splice(index, 1, item);
        this.setData({
            categories: list
        });
    },
    clickRow(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        if (item.showDel) {
            delete item.showDel;
            let list = this.data.categories.slice();
            list.splice(index, 1, item);
            this.setData({
                categories: list
            });
        }
    },
    doDelete(e) {
        let item = e.currentTarget.dataset.item;
        wx.showModal({
            title: '系统提示',
            content: `确认删除【${item.name}】吗？`,
            success: sm => {
                if (sm.confirm) {
                    wx.request({
                        url: 'https://uglifan.cn/api/category/delete',
                        data: {
                            id: item.id
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST',
                        success: response => {
                            let res = response.statusCode === 200 && response.data ? response.data : {};
                            if (res.code === 0) {
                                this.onQuery();
                                wx.showToast({
                                    icon: 'success',
                                    title: '删除成功'
                                })
                            } else {
                                wx.showToast({
                                    icon: 'none',
                                    title: res.message
                                })
                            }
                        },
                        fail: err => {
                            wx.showToast({
                                icon: 'none',
                                title: err.message
                            })
                        }
                    })
                }
            }
        });
    },
    addCategory() {
        let type = this.data.categoryTypes[this.data.current].value;
        wx.navigateTo({
            url: `/pages/categories/add-category?type=${type}`
        });
    }
})