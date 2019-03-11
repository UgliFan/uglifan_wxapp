const app = getApp()
Component({
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
        isX: false
    },
    lifetimes: {
        attached() {
            let sysInfo = app.globalData.sysInfo
            this.setData({
                isX: sysInfo.isX
            })
        }
    },
    methods: {

    }
})
