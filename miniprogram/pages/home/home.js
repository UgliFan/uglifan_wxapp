Page({
    data: {
        year: '',
        month: '',
        count: {
            inCount: '0.00',
            outCount: '0.00'
        },
        shown: false
    },
    onLoad(option) {
        this.setData({
            year: '2019年',
            month: '02',
            count: {
                inCount: '2.00',
                outCount: '3.02'
            }
        })
    },
    showPicker(e) {},
    create() {
        this.setData({
            shown: true
        });
    },
    closeCreate() {
        this.setData({
            shown: false
        });
    }
})
