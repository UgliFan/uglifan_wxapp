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
        gIndex: -1,
        index: -1
    },
    methods: {
        longPress(e) {
            const item = e.currentTarget.dataset.item
            const index = e.currentTarget.dataset.index
            let splitIndex = index.split('-')
            if (item.isMine) {
                item.options = true
                this.setData({
                    gIndex: Number(splitIndex[0]),
                    index: Number(splitIndex[1])
                })
                this.triggerEvent('change', { item, gIndex: this.data.gIndex, index: this.data.index })
            }
        },
        stopOptions() {
            if (this.data.gIndex > -1 && this.data.index > -1) {
                const gIndex = this.data.gIndex;
                const index = this.data.index;
                const item = this.data.list[this.data.gIndex].list[this.data.index]
                delete item.options
                this.setData({
                    gIndex: -1,
                    index: -1
                })
                this.triggerEvent('change', { item, gIndex, index })
            }
        },
        deleteTally(e) {
            const item = e.currentTarget.dataset.item
            if (item.isMine) {
                wx.showModal({
                    title: '危险操作',
                    content: `确认删除【${item.came}: ${item.summary}】吗？`,
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
