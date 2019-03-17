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
        categories: [],
        navHeight: 64,
        tabHeight: 0,
        scrollTop: 0,
        styleStr: '',
        scrollable: true,
        deleting: false,
        moving: {
            y: 0,
            offset: 0,
            shown: false,
            selectIndex: -1,
            startY: 0,
            selectItem: {}
        }
    },
    onLoad() {
        const nav = app.globalData.nav
        const sysInfo = app.globalData.sysInfo
        const query = wx.createSelectorQuery()
        query.select('#typeTab').boundingClientRect()
        query.exec(res => {
            let tabHeight = res[0].height
            const navHeight = nav.paddingTop + nav.height
            this.setData({
                navHeight: navHeight,
                tabHeight: tabHeight,
                styleStr: `height: ${sysInfo.screenHeight - navHeight - tabHeight}px`
            })
        })
    },
    onShow() {
        this.onQuery()
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
                        deleting: false,
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
        let index = e.currentTarget.dataset.index
        this.setData({
            current: index
        })
        this.onQuery()
    },
    beforeDel(e) {
        let item = e.currentTarget.dataset.item
        let index = e.currentTarget.dataset.index
        item.showDel = true
        let list = this.data.categories.slice()
        list.splice(index, 1, item)
        this.setData({
            categories: list,
            deleting: true
        })
    },
    clickRow(e) {
        let item = e.currentTarget.dataset.item
        let index = e.currentTarget.dataset.index
        if (item.showDel) {
            delete item.showDel
            let list = this.data.categories.slice()
            list.splice(index, 1, item)
            this.setData({
                categories: list,
                deleting: false
            })
        }
    },
    doDelete(e) {
        let item = e.currentTarget.dataset.item
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
        })
    },
    addCategory() {
        let type = this.data.categoryTypes[this.data.current].value
        wx.navigateTo({
            url: `/pages/categories/add-category?type=${type}`
        })
    },
    handlerScroll(e) {
        var scrollTop = e.detail.scrollTop
        this.setData({
            scrollTop: scrollTop
        })
    },
    start(e) {
        let startY = e.changedTouches[0].clientY
        const index = Math.round((startY - this.data.navHeight - this.data.tabHeight + this.data.scrollTop - 25) / 50)
        let list = this.data.categories
        let item = list[index]
        if (item) {
            item.cls = 'moving'
            let y = startY - this.data.navHeight - this.data.tabHeight
            let offset = y % 50
            y = y - offset
            list.splice(index, 1, item)
            this.setData({
                categories: list,
                scrollable: false,
                moving: {
                    y: y,
                    offset: offset,
                    shown: true,
                    selectIndex: index,
                    startY: startY,
                    selectItem: item
                }
            })
        }
    },
    move(e) {
        if (this.data.moving.shown) {
            var item = this.data.moving.selectItem
            let startY = this.data.moving.startY
            var index = this.data.moving.selectIndex
            let y = e.changedTouches[0].clientY - this.data.navHeight - this.data.tabHeight - this.data.moving.offset
            let moveY = e.changedTouches[0].clientY - startY
            var list = this.data.categories
            if (moveY > 25 && index < list.length - 1) {
                list.splice(index, 1)
                list.splice(++index, 0, item)
                startY += 50
            }
            if (moveY < -25 && index > 0) {
                list.splice(index, 1)
                list.splice(--index, 0, item)
                startY -= 50
            }
            this.setData({
                categories: list,
                moving: {
                    y: y,
                    offset: this.data.moving.offset,
                    shown: true,
                    selectIndex: index,
                    startY: startY,
                    selectItem: item
                }
            })
        }
    },
    end(e) {
        if (this.data.moving.shown) {
            wx.showLoading({
                title: '更新排序中'
            })
            let list = this.data.categories
            let item = this.data.moving.selectItem
            delete item.cls
            list.splice(this.data.moving.selectIndex, 1, item)
            let ids = list.map(item => {
                return item.id
            })
            wx.request({
                url: 'https://uglifan.cn/api/category/order',
                data: {
                    ids: ids.join(','),
                    type: this.data.current
                },
                method: 'POST',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        wx.showToast({
                            icon: 'success',
                            title: '排序更新成功'
                        })
                    }
                },
                complete: () => {
                    this.setData({
                        categories: list,
                        scrollable: true,
                        moving: {
                            y: 0,
                            offset: 0,
                            shown: false,
                            selectIndex: -1,
                            startY: 0,
                            selectItem: {}
                        }
                    })
                    wx.hideLoading()
                }
            })
        }
    }
})