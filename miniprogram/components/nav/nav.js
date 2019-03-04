const app = getApp()
Component({
    properties: {
        back: {
            type: Boolean,
            value: false
        },
        background: {
            type: String,
            value: '#ffffff',
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        },
        placeholderBg: {
            type: String,
            value: 'transparent',
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        },
        color: {
            type: String,
            value: '#000000',
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        },
        fontSize: {
            type: String,
            value: '40rpx',
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        },
        title: {
            type: String,
            value: 'none',
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        },
        fixed: {
            type: Boolean,
            value: true,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal !== false && newVal !== true) {
                    let obj = {}
                    obj[changedPath[0]] = oldVal
                    this.setData(obj)
                }
            }
        }
    },
    data: {
        isX: false,
        height: 44, //导航栏高度
        paddingTop: 20, //导航栏上内边距对应状态栏高度
        showHomeButton: false, //是否显示返回首页
        show: true //是否显示导航栏
    },
    lifetimes: {
        attached() {
            let pages = getCurrentPages()
            let showHomeButton = false
            if (pages.length < 2 && pages[0].route != __wxConfig.pages[0]) {
                showHomeButton = true
            }
            //导航栏自适应
            let systemInfo = app.globalData.sysInfo
            let reg = /ios/i
            let pt = 20 //导航状态栏上内边距
            let h = 44 //导航状态栏高度
            if (reg.test(systemInfo.system)) {
                pt = systemInfo.statusBarHeight
                h = 44
            } else {
                pt = systemInfo.statusBarHeight
                h = 48
            }
            this.setData({
                height: h,
                paddingTop: pt,
                showHomeButton: showHomeButton,
                isX: systemInfo.isX
            })
            console.log(this)
        }
    },
    methods: {
        navigateBack() {
            let pages = getCurrentPages();
            if (pages.length < 2 && pages[0].route != __wxConfig.pages[0]) {
                wx.reLaunch({ url: '/' + __wxConfig.pages[0] })
            } else {
                wx.navigateBack({ delta: 1 })
            }
        },
        navigateBackHome() {
            wx.reLaunch({ url: '/' + __wxConfig.pages[0] })
        },
        toggleShow() {
            this.setData({ show: !this.data.show })
        }
    }
})
