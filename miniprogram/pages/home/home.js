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
        list: [],
        page: 0,
        pageSize: 20,
        hasNext: true,
        isX: false,
        navHeight: 64
    },
    onLoad(option) {
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        else month = month.toString();
        let select = [this.data.pickerArray[0].indexOf(year), this.data.pickerArray[1].indexOf(month)];
        const sysInfo = app.globalData.sysInfo;
        const nav = app.globalData.nav;
        this.setData({
            pickerSelect: select,
            year: this.data.pickerArray[0][select[0]],
            month: this.data.pickerArray[1][select[1]],
            isX: sysInfo.isX,
            navHeight: nav.paddingTop + nav.height
        })
        this.getTallyList(true)
    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                current: 0
            })
        }
    },
    onPullDownRefresh() {
        this.getTallyList(true, true)
    },
    onReachBottom() {
        this.getTallyList()
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
        this.setData({
            shown: true
        });
    },
    closeCreate(e) {
        this.setData({
            shown: false
        });
        if (e.detail) {
            this.getTallyList(true);
        }
    },
    getTallyList(reload = false, isPullDown = false) {
        if (this.data.hasNext || reload) {
            if (reload && !isPullDown) {
                wx.pageScrollTo({
                    scrollTop: 0
                })
            }
            wx.showLoading({
                title: '加载中'
            })
            const coltName = `tally_${this.data.year}_${this.data.month}`
            wx.cloud.callFunction({
                name: 'checkTally',
                data: { coltName }
            }).then(res => {
                let result = res.result || {};
                if (result.code === 0) {
                    const db = wx.cloud.database()
                    let skip = reload ? 0 : this.data.page * this.data.pageSize;
                    db.collection(coltName).orderBy('date', 'desc').skip(skip).limit(this.data.pageSize).get({
                        success: res => {
                            let list = res.data || [];
                            let count = {
                                inCount: reload ? 0 : Number(this.data.count.inCount) * 100,
                                outCount: reload ? 0 : Number(this.data.count.outCount) * 100
                            };
                            let result = list.map(item => {
                                if (item.select.type === 0) {
                                    count.outCount += item.summary
                                } else {
                                    count.inCount += item.summary
                                }
                                return {
                                    select: item.select,
                                    summary: (item.summary / 100).toFixed(2),
                                    remark: item.remark,
                                    location: item.location,
                                    isMine: item._openid === app.globalData.openId
                                }
                            })
                            this.setData({
                                list: reload ? result : this.data.list.concat(result),
                                page: reload ? 1 : (res.data.length < this.data.pageSize ? this.data.page : this.data.page + 1),
                                hasNext: res.data.length === this.data.pageSize,
                                count: {
                                    inCount: (count.inCount / 100).toFixed(2),
                                    outCount: (count.outCount / 100).toFixed(2)
                                }
                            });
                        },
                        fail: err => {
                            wx.showToast({
                                title: err.message
                            })
                        },
                        complete: () => {
                            if (isPullDown) wx.stopPullDownRefresh()
                            wx.hideLoading()
                        }
                    })
                } else {
                    if (isPullDown) wx.stopPullDownRefresh()
                    wx.hideLoading()
                    wx.showToast({
                        title: result.message
                    })
                }
            }).catch(err => {
                if (isPullDown) wx.stopPullDownRefresh()
                wx.hideLoading()
                wx.showToast({
                    title: err.message
                })
            })
        }
    },
    showLocation(e) {
        let location = e.currentTarget.dataset.loc;
        wx.openLocation({
            latitude: location.latitude,
            longitude: location.longitude
        })
    }
})
