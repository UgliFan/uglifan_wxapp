const app = getApp()
Page({
    data: {
        year: '',
        month: '',
        pickerArray: [['2019'], ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']],
        pickerSelect: [0, 0],
        count: {
            inCount: '0.00',
            outCount: '0.00'
        },
        shown: false,
        modify: null,
        list: [],
        groupList: [],
        page: 0,
        pageSize: 20,
        hasNext: true,
        isX: false,
        navHeight: 64,
        styleStr: '',
        scrollTop: 0
    },
    onLoad(option) {
        let date = new Date()
        let year = date.getFullYear().toString()
        let month = date.getMonth() + 1
        if (month < 10) month = `0${month}`
        else month = month.toString()
        let select = [this.data.pickerArray[0].indexOf(year), this.data.pickerArray[1].indexOf(month)]
        const sysInfo = app.globalData.sysInfo
        console.log(sysInfo)
        const nav = app.globalData.nav
        const navHeight = nav.paddingTop + nav.height
        this.setData({
            pickerSelect: select,
            year: this.data.pickerArray[0][select[0]],
            month: this.data.pickerArray[1][select[1]],
            isX: sysInfo.isX,
            navHeight: navHeight,
            styleStr: `height:${sysInfo.screenHeight - navHeight}px;top:${navHeight}px`
        })
        this.getTallyList(true)
    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                current: 0,
                centerAvaliable: true
            })
        }
    },
    navRefresh() {
        this.getTallyList(true)
    },
    scrollReachBottom() {
        this.getTallyList()
    },
    onTabItemTap() {
        this.cancelOptions()
    },
    pickerChange(e) {
        let value = e.detail.value;
        this.setData({
            pickerSelect: value,
            year: this.data.pickerArray[0][value[0]],
            month: this.data.pickerArray[1][value[1]]
        })
        this.getTallyList(true)
    },
    centerClick() {
        this.getTabBar().setData({
            centerClicked: !this.data.shown
        })
        let params = {
            shown: !this.data.shown
        }
        if (!params.shown) params.modify = null
        this.setData(params)
    },
    closeCreate(e) {
        this.setData({
            shown: false,
            modify: null
        });
        this.getTabBar().setData({
            centerClicked: false
        })
        if (e.detail) {
            this.getTallyList(true);
        }
    },
    listChange(e) {
        const item = e.detail.item
        const index = e.detail.index
        let list = this.data.list
        list.splice(index, 1, item)
        this.setData({
            list: list
        })
    },
    cancelOptions() {
        this.selectComponent('#tallyItems').stopOptions()
    },
    modifyItem(e) {
        const item = e.detail
        this.setData({
            modify: item
        })
        this.centerClick()
    },
    deleteItem(e) {
        const item = e.detail
        console.log(item)
        wx.showLoading({
            title: '删除中'
        })
        wx.request({
            url: 'https://uglifan.cn/api/tally/delete',
            data: {
                id: item.id,
                y: this.data.year,
                m: this.data.month
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                cookie: `__source_op=${app.globalData.openId || ''}`
            },
            method: 'POST',
            success: response => {
                let res = response.statusCode === 200 && response.data ? response.data : {};
                if (res.code === 0) {
                    wx.showToast({
                        icon: 'success',
                        title: '删除成功'
                    })
                    this.getTallyList(true);
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
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },
    getTallyList(reload = false) {
        if (this.data.hasNext || reload) {
            if (reload) {
                this.setData({
                    scrollTop: 0
                })
            }
            wx.showLoading({
                title: '加载中'
            })
            wx.request({
                url: 'https://uglifan.cn/api/tally/page',
                data: {
                    p: reload ? 0 : this.data.page,
                    ps: this.data.pageSize,
                    y: this.data.year,
                    m: this.data.month
                },
                method: 'GET',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        let list = res.result || []
                        let count = res.sum || { inCount: 0, outCount: 0 }
                        let group = res.group || {}
                        let groupList = []
                        for (let key in group) {
                            if (key && group.hasOwnProperty(key)) {
                                let value = group[key].list || []
                                let gList = value.map(item => {
                                    if (item.latitude && item.longitude) {
                                        item.location = {
                                            latitude: item.latitude,
                                            longitude: item.longitude
                                        }
                                        delete item.latitude
                                        delete item.longitude
                                    }
                                    item.summary = (item.summary / 100).toFixed(2)
                                    item.isMine = item.open_id === app.globalData.openId
                                    delete item.open_id
                                    delete item.date_format
                                    return item
                                });
                                groupList.push({
                                    title: key,
                                    list: gList,
                                    order: group[key].order
                                })
                            }
                        }
                        let result = list.map(item => {
                            if (item.latitude && item.longitude) {
                                item.location = {
                                    latitude: item.latitude,
                                    longitude: item.longitude
                                }
                                delete item.latitude
                                delete item.longitude
                            }
                            item.summary = (item.summary / 100).toFixed(2)
                            item.isMine = item.open_id === app.globalData.openId
                            delete item.open_id
                            delete item.date_format
                            return item
                        });
                        this.setData({
                            list: reload ? result : this.data.list.concat(result),
                            groupList: groupList,
                            page: reload ? 1 : (list.length < this.data.pageSize ? this.data.page : this.data.page + 1),
                            hasNext: list.length === this.data.pageSize,
                            count: {
                                inCount: (count.inCount / 100).toFixed(2),
                                outCount: (count.outCount / 100).toFixed(2)
                            }
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
                        title: err.message || '未知错误.'
                    })
                },
                complete: () => {
                    wx.hideLoading()
                }
            })
        }
    }
})
