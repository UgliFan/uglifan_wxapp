// miniprogram/pages/categories/categories.js
Page({
    data: {
        categoryTypes: [{
            value: 0,
            label: '支出'
        }, {
            value: 1,
            label: '收入'
        }],
        current: 0,
        categories: {},

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.onQuery();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },
    /**
     * 生命周期函数--监听页面卸载
     */
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
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    onQuery() {
        const db = wx.cloud.database()
        // 查询所有类别
        db.collection('categories').where({
            type: this.data.categoryTypes[this.data.current].value
        }).get({
            success: res => {
                this.setData({
                    categories: res.data
                })
                console.log('[数据库] [查询记录] 成功: ', res)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            }
        })
    },
    tabSelect(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            current: index
        });
        this.onQuery();
    },
    beforeDel(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        item.showDel = true;
        let list = this.data.categories.slice();
        list.splice(index, 1, item);
        this.setData({
            categories: list
        });
    },
    clickRow(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        if (item.showDel) {
            delete item.showDel;
            let list = this.data.categories.slice();
            list.splice(index, 1, item);
            this.setData({
                categories: list
            });
        }
    },
    doDelete(e) {
        let that = this;
        let item = e.currentTarget.dataset.item;
        wx.showModal({
            title: '系统提示',
            content: `确认删除【${item.name}】吗？`,
            success(sm) {
                if (sm.confirm) {
                    const db = wx.cloud.database();
                    db.collection('categories').doc(item._id).remove({
                        success(res) {
                            console.log(res);
                            that.onQuery();
                        }
                    })
                }
            }
        });
    },
    addCategory() {
        let type = this.data.categoryTypes[this.data.current].value;
        wx.navigateTo({
            url: `/pages/categories/add-category?type=${type}`
        });
    }
})