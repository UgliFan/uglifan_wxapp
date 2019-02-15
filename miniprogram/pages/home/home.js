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
        shown: false
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
            year: `${this.data.pickerArray[0][select[0]]}年`,
            month: this.data.pickerArray[1][select[1]],
            count: {
                inCount: '2.00',
                outCount: '3.02'
            }
        })
    },
    onPullDownRefresh() {
        wx.stopPullDownRefresh()
    },
    pickerChange(e) {
        let value = e.detail.value;
        this.setData({
            pickerSelect: value,
            year: `${this.data.pickerArray[0][value[0]]}年`,
            month: this.data.pickerArray[1][value[1]]
        })
    },
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
