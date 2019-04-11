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
        typeArr: ['全部', '我的'],
        type: 0,
        current: 'pie',
        chartTypes: [{
            type: 'pie', label: '分类占比'
        }, {
            type: 'bar', label: '按天统计'
        }, {
            type: 'all', label: '总览'
        }]
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
                    type: this.data.type,
                    chart: this.data.current
                })
            })
        }
    },
    methods: {
        chartChange(e) {
            let item = e.currentTarget.dataset.item
            this.setData({
                current: item.type
            })
            this.triggerEvent('change', {
                y: this.data.year,
                m: this.data.month,
                type: this.data.type,
                chart: this.data.current
            })
        },
        dateChange(e) {
            let value = e.detail.value
            this.setData({
                dateSelect: value,
                year: this.data.dateArr[0][value[0]],
                month: this.data.dateArr[1][value[1]]
            })
            this.triggerEvent('change', {
                y: this.data.year,
                m: this.data.month,
                type: this.data.type,
                chart: this.data.current
            })
        },
        typeChange(e) {
            this.setData({
                type: Number(e.detail.value)
            })
            this.triggerEvent('change', {
                y: this.data.year,
                m: this.data.month,
                type: this.data.type,
                chart: this.data.current
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
