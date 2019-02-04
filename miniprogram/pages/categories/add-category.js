// miniprogram/pages/categories/add-category.js
const iconList = require('../../icons.js');
Page({
    data: {
        iconSelect: '',
        inputValue: '',
        type: null,
        iconList: []
    },
    onLoad: function (options) {
        this.setData({
            iconSelect: iconList[0].className,
            iconList: iconList,
            type: Number(options.type)
        });
    },
    onReady: function () {

    },
    onShow: function () {

    },
    onHide: function () {

    },
    onUnload: function () {

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    onShareAppMessage: function () {

    },
    selectIcon(e) {
        let item = e.currentTarget.dataset.item;
        if (item.className !== this.data.iconSelect) {
            this.setData({
                iconSelect: item.className
            });
        }
    },
    bindKeyInput(e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
    saveCategory() {
        if (this.data.inputValue && this.data.iconSelect) {
            let params = {
                icon: this.data.iconSelect,
                name: this.data.inputValue,
                type: this.data.type,
                remark: ''
            };
            const db = wx.cloud.database();
            db.collection('categories').add({
                data: params
            }).then(res => {
                wx.navigateBack({
                    delta: 1
                });
            });
        }
    }
})