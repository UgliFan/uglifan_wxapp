Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        list: {
            type: Array,
            value: [],
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
        current: -1
    },
    methods: {
        showLocation(e) {
            const item = e.currentTarget.dataset.item
            if (!item.options) {
                let loc = item.location
                wx.openLocation({
                    latitude: loc.latitude,
                    longitude: loc.longitude
                })
            }
        },
        longPress(e) {
            const item = e.currentTarget.dataset.item
            const index = e.currentTarget.dataset.index
            if (item.isMine) {
                item.options = true
                this.setData({
                    current: index
                })
                this.triggerEvent('change', { item, index })
            }
        },
        stopOptions() {
            if (this.data.current > -1) {
                const index = this.data.current
                const item = this.data.list[index]
                delete item.options
                this.setData({
                    current: -1
                })
                this.triggerEvent('change', { item, index })
            }
        },
        deleteTally(e) {
            const item = e.currentTarget.dataset.item
            if (item.isMine) {
                wx.showModal({
                    title: '危险操作',
                    content: `确认删除【${item.select.name}: ${item.summary}】吗？`,
                    confirmColor: '#F2A905',
                    cancelText: '再想想',
                    success: res => {
                        if (res.confirm) {
                            this.triggerEvent('del', item)
                        }
                    }
                })
            }
        },
        modifyTally(e) {
            const item = e.currentTarget.dataset.item
            if (item.isMine) {
                this.triggerEvent('modify', item)
            }
        }
    }
})
