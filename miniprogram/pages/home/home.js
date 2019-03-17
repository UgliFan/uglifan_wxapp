const app = getApp()
Page({
    data: {
        year: '',
        month: '',
        pickerArray: [[], ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']],
        pickerSelect: [0, 0],
        count: {
            inCount: '0.00',
            outCount: '0.00'
        },
        shown: false,
        modify: null,
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
        this.getPickerItems().then(picker => {
            const yearArr = picker.length > 0 ? picker : [year]
            const sysInfo = app.globalData.sysInfo
            const nav = app.globalData.nav
            const navHeight = nav.paddingTop + nav.height
            let select = [yearArr.indexOf(year), this.data.pickerArray[1].indexOf(month)]
            this.setData({
                pickerArray: [yearArr, this.data.pickerArray[1]],
                pickerSelect: select,
                year: year,
                month: month,
                isX: sysInfo.isX,
                navHeight: navHeight,
                styleStr: `height:${sysInfo.screenHeight - navHeight}px;top:${navHeight}px`
            })
            this.getTallyList(true)
        })
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
        const { item, gIndex, index } = e.detail
        let groupList = this.data.groupList
        let list = groupList[gIndex].list
        list.splice(index, 1, item)
        groupList[gIndex].list = list
        this.setData({
            groupList: groupList
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
    getPickerItems() {
        return new Promise(reslove => {
            wx.request({
                url: 'https://uglifan.cn/api/common/years',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        reslove(res.result)
                    } else {
                        reslove({})
                    }
                },
                fail: () => {
                    reslove({})
                }
            })
        })
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
                        let count = res.sum || { inCount: 0, outCount: 0 }
                        let group = res.result || {}
                        let groupList = reload ? [] : this.data.groupList
                        let length = 0;
                        for (let key in group) {
                            if (key !== '未知日期' && group.hasOwnProperty(key)) {
                                let value = group[key].list || []
                                length += value.length;
                                let gList = value.map(item => {
                                    delete item.latitude
                                    delete item.longitude
                                    item.summary = (item.summary / 100).toFixed(2)
                                    item.isMine = item.open_id === app.globalData.openId
                                    item.create_at = item.create_at.split(' ')[1].substr(0, 5)
                                    delete item.open_id
                                    delete item.date_format
                                    if (item.nickName && item.avatar) {
                                        item.user = {
                                            name: item.nickName,
                                            avatar: item.avatar,
                                            gender: item.gender
                                        }
                                    }
                                    delete item.nickName
                                    delete item.avatar
                                    delete item.gender
                                    return item
                                });
                                if (!reload && groupList[groupList.length - 1].title === key) {
                                    let tempList = groupList[groupList.length - 1].list
                                    groupList[groupList.length - 1].list = tempList.concat(gList)
                                } else {
                                    groupList.push({
                                        title: key,
                                        list: gList,
                                        order: group[key].order
                                    })
                                }
                            } else if (key === '未知日期') {
                                let value = group[key].list || []
                                length += value.length;
                                // TODO 隐藏，并提示隐藏数
                            }
                        }
                        this.setData({
                            groupList: groupList,
                            page: reload ? 1 : (length < this.data.pageSize ? this.data.page : this.data.page + 1),
                            hasNext: length === this.data.pageSize,
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
