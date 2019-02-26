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
        scrollH: 'auto',
        list: []
    },
    onLoad(option) {
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        else month = month.toString();
        let select = [this.data.pickerArray[0].indexOf(year), this.data.pickerArray[1].indexOf(month)];
        this.setData({
            pickerSelect: select,
            year: this.data.pickerArray[0][select[0]],
            month: this.data.pickerArray[1][select[1]]
        })
        let query = this.createSelectorQuery();
        query.select('.header').boundingClientRect().exec(res => {
            let rect = res[0];
            if (rect) {
                let sysInfo = app.globalData.sysInfo
                this.setData({
                    scrollH: `${sysInfo.windowHeight - rect.height}px`
                });
            }
        })
        this.getTallyList()
        console.log(app.globalData.userInfo)
    },
    onPullDownRefresh() {
        wx.stopPullDownRefresh()
        this.getTallyList()
    },
    pickerChange(e) {
        let value = e.detail.value;
        this.setData({
            pickerSelect: value,
            year: this.data.pickerArray[0][value[0]],
            month: this.data.pickerArray[1][value[1]]
        })
        this.getTallyList()
    },
    create() {
        this.setData({
            shown: true
        });
    },
    closeCreate(e) {
        this.setData({
            shown: false
        });
        if (e.detail) {
            this.getTallyList();
        }
    },
    getTallyList() {
        wx.showLoading({
            title: '刷新中'
        })
        const coltName = `tally_${this.data.year}_${this.data.month}`
        wx.cloud.callFunction({
            name: 'checkTally',
            data: { coltName }
        }).then(res => {
            let result = res.result || {};
            if (result.code === 0) {
                const db = wx.cloud.database()
                db.collection(coltName).orderBy('date', 'desc').get().then(res => {
                    let list = res.data || [];
                    let count = {
                        inCount: 0,
                        outCount: 0
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
                            location: item.location
                        }
                    })
                    this.setData({
                        list: result,
                        count: {
                            inCount: (count.inCount / 100).toFixed(2),
                            outCount: (count.outCount / 100).toFixed(2)
                        }
                    });
                    wx.hideLoading()
                }).catch(err => {
                    wx.hideLoading()
                    wx.showToast({
                        title: err.message
                    })
                })
            } else {
                wx.hideLoading()
                wx.showToast({
                    title: result.message
                })
            }
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message
            })
        })
    },
    showLocation(e) {
        let location = e.currentTarget.dataset.loc;
        wx.openLocation({
            latitude: location.latitude,
            longitude: location.longitude
        })
    }
})
