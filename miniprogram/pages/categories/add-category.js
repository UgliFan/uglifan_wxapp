const app = getApp()
const iconList = require('../../icons.js')
Page({
    data: {
        iconSelect: '',
        inputValue: '',
        type: null,
        iconList: [],
        navHeight: 64
    },
    onLoad (options) {
        const nav = app.globalData.nav
        this.setData({
            iconSelect: iconList[0].className,
            iconList: iconList,
            type: Number(options.type),
            navHeight: nav.paddingTop + nav.height
        });
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
        } else {
            wx.showToast({
                icon: 'none',
                title: '请输入类别名称'
            })
        }
    }
})