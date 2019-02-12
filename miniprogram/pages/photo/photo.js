Page({
    data: {
        listL: [],
        listR: []
    },
    onShow() {
        this.onQuery();
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
    onQuery() {
        const db = wx.cloud.database()
        // 查询所有类别
        db.collection('photos').get({
            success: res => {
                let left = { list: [], height: 0 };
                let right = { list: [], height: 0 };
                res.data.forEach(item => {
                    if (left.height > right.height) {
                        right.height = right.height + item.viewH;
                        right.list.push(item);
                    } else {
                        left.height = left.height + item.viewH;
                        left.list.push(item);
                    }
                });
                this.setData({
                    listL: left.list,
                    listR: right.list
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
            }
        })
    },
    doUpload() {
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                console.log(res);
                wx.showLoading({
                    title: '上传中',
                })
                const filePath = res.tempFilePaths[0]
                const cloudPath = Date.now() + filePath.match(/\.[^.]+?$/)[0]
                wx.cloud.uploadFile({
                    cloudPath,
                    filePath,
                    success: file => {
                        wx.showLoading({
                            title: '获取图片信息',
                        })
                        wx.getImageInfo({
                            src: file.fileID,
                            success(info) {
                                let params = {
                                    name: cloudPath,
                                    src: file.fileID,
                                    tag: '',
                                    time: new Date(),
                                    width: info.width,
                                    height: info.height,
                                    viewH: Math.round(info.height * 1000 / info.width),
                                    type: info.type
                                };
                                that.savePhoto(params);
                            },
                            fail() {
                                wx.hideLoading()
                            }
                        })
                    },
                    fail: e => {
                        wx.hideLoading()
                        wx.showToast({
                            icon: 'none',
                            title: '上传失败',
                        })
                    }
                })
            },
            fail: e => {
                console.error(e)
            }
        })
    },
    savePhoto(params) {
        wx.showLoading({
            title: '信息存储中',
        })
        let that = this;
        const db = wx.cloud.database()
        db.collection('photos').add({
            data: params
        }).then(res => {
            wx.showToast({
                icon: 'none',
                title: '上传成功'
            })
            that.onQuery();
            wx.hideLoading();
        }, () => {
            wx.hideLoading();
        });
    },
    previewImage(e) {
        let current = e.currentTarget.dataset.item;
        let list = this.data.list.map(item => { return item.src; });
        wx.previewImage({
            urls: list,
            current: current.src
        })
    },
    showRemove(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        let pos = e.currentTarget.dataset.pos;
        item.showDel = true;
        let list = pos === 0 ? this.data.listL : this.data.listR;
        list.splice(index, 1, item);
        this.setData(pos === 0 ? {
            listL: list
        } : {
            listR: list
        });
    },
    closeOptions(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        let pos = e.currentTarget.dataset.pos;
        delete item.showDel;
        let list = pos === 0 ? this.data.listL : this.data.listR;
        list.splice(index, 1, item);
        this.setData(pos === 0 ? {
            listL: list
        } : {
            listR: list
        });
    },
    doDelete(e) {
        let that = this;
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        wx.showLoading({
            title: '删除文件中',
        })
        wx.cloud.deleteFile({
            fileList: [item.src],
            success(res) {
                let fileRes = res.fileList[0];
                if (fileRes.status === 0) {
                    const db = wx.cloud.database()
                    wx.showLoading({
                        title: '删除记录中',
                    })
                    db.collection('photos').doc(item._id).remove({
                        success() {
                            wx.hideLoading();
                            wx.showToast({
                                icon: 'none',
                                title: '删除成功'
                            })
                            that.onQuery();
                        }
                    });
                } else {
                    console.error(fileRes.errMsg);
                    wx.hideLoading();
                }
            },
            fail: console.error,
            complete() {
                that.closeOptions(e);
            }
        });
    }
})