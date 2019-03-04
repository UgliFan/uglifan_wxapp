const app = getApp()
Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        title: {
            type: String,
            value: 'UF记账本',
            observer(n, o, cp) {
                if (!n) {
                    let obj = {}
                    obj[cp[0]] = o
                    this.setData(obj)
                }
            }
        },
        back: {
            type: Boolean,
            value: false,
            observer(n, o, cp) {
                if (!n) {
                    let obj = {}
                    obj[cp[0]] = o
                    this.setData(obj)
                }
            }
        },
        fnClass: {
            type: String,
            value: '',
            observer(n, o, cp) {
                if (!n) {
                    let obj = {}
                    obj[cp[0]] = o
                    this.setData(obj)
                }
            }
        }
    },
    data: {
        styleStr: 'padding-top:22px;height:44px;line-height:44px;',
        backStr: 'top:28px;',
        showHome: false //是否显示返回首页
    },
    lifetimes: {
        attached() {
            let pages = getCurrentPages()
            let showHome = false
            if (pages.length < 2 && pages[0].route != __wxConfig.pages[0]) {
                showHome = true
            }
            let nav = app.globalData.nav
            this.setData({
                showHome: showHome,
                styleStr: nav.styleStr,
                backStr: `top:${nav.paddingTop + 6}px`
            })
        }
    },
    methods: {
        navScan() {
            wx.scanCode({
                success: res => {
                    console.log(res)
                    wx.showModal({
                        title: '扫码结果',
                        content: res.charSet
                    })
                }
            })
        },
        navBack() {
            let pages = getCurrentPages();
            if (pages.length < 2 && pages[0].route != __wxConfig.pages[0]) {
                wx.reLaunch({ url: '/' + __wxConfig.pages[0] })
            } else {
                wx.navigateBack({ delta: 1 })
            }
        },
        navHome() {
            wx.reLaunch({ url: '/' + __wxConfig.pages[0] })
        },
        navFn() {
            this.triggerEvent('navAction')
        }
    }
})
