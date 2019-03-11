const app = getApp()
Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        active: {
            type: Boolean,
            value: false,
            observer(newValue) {
                this.setData({
                    active: newValue
                })
            }
        }
    },
    data: {
        isX: false,
        year: '',
        month: '',
        dateArr: [[], ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']],
        dateSelect: [0, 0],
        typeArr: ['支出', '收入'],
        type: 0
    },
    lifetimes: {
        attached() {
            let date = new Date()
            let year = date.getFullYear().toString()
            let month = date.getMonth() + 1
            if (month < 10) month = `0${month}`
            else month = month.toString()
            this.getPickerItems().then(picker => {
                const yearArr = picker.length > 0 ? picker : [year]
                const sysInfo = app.globalData.sysInfo
                let select = [yearArr.indexOf(year), this.data.dateArr[1].indexOf(month)]
                this.setData({
                    dateArr: [yearArr, this.data.dateArr[1]],
                    dateSelect: select,
                    year: year,
                    month: month,
                    isX: sysInfo.isX
                })
                this.triggerEvent('ready', {
                    y: year,
                    m: month,
                    type: this.data.type
                })
            })
        }
    },
    methods: {
        dateChange(e) {
            let value = e.detail.value;
            this.setData({
                dateSelect: value,
                year: this.data.dateArr[0][value[0]],
                month: this.data.dateArr[1][value[1]]
            })
            this.triggerEvent('change', {
                y: this.data.year,
                m: this.data.month,
                type: this.data.type
            })
        },
        typeChange(e) {
            this.setData({
                type: e.detail.value
            })
            this.triggerEvent('change', {
                y: this.data.year,
                m: this.data.month,
                type: this.data.type
            })
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
        }
    }
})
