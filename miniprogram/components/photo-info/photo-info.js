const app = getApp()
Component({
    properties: {
        show: {
            type: Boolean,
            value: false,
            observer(newValue) {
                if (newValue) {
                    this.setData({
                        shown: newValue
                    });
                    let timer = setTimeout(() => {
                        this.setData({
                            anime: newValue
                        });
                        clearTimeout(timer);
                    }, 50);
                } else {
                    this.setData({
                        anime: newValue
                    });
                    let timer = setTimeout(() => {
                        this.setData({
                            shown: newValue,
                            name: '',
                            tag: ''
                        });
                        clearTimeout(timer);
                    }, 300);
                }
            }
        },
        needScale: {
            type: Boolean,
            value: false
        }
    },
    data: {
        shown: false,
        anime: false,
        name: '',
        tag: '',
        isX: false
    },
    lifetimes: {
        attached() {
            const sysInfo = app.globalData.sysInfo
            this.setData({
                isX: sysInfo.isX
            })
        }
    },
    methods: {
        submitForm(e) {
            let form = e.detail.value;
            if (form.name) {
                if (form.tag) {
                    let tag = form.tag.replace(/，/g, ',').split(',')
                    form.tag = tag;
                }
                this.triggerEvent('submit', form);
            } else {
                wx.showModal({
                    title: '警告',
                    content: '标题是必填项',
                    confirmText: '知道了',
                    showCancel: false
                })
            }
        }
    }
})
