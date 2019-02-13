const app = getApp();

Page({
    data: {
        infoShown: false,
        chooseInfo: null,
        location: null,
        list: [],
        listL: [],
        listR: [],
        page: 0,
        pageSize: 20,
        hasNext: true,
        delIndex: -1,
        delPos: '',
        loading: false
    },
    onLoad() {
        this.onQuery(true);
    },
    onPullDownRefresh() {
        this.setData({
            loading: true
        });
        this.onQuery(true, true);
    },
    onReachBottom() {
        this.onQuery();
    },
    onQuery(reset = false, isPullDown = false) {
        if (reset && !isPullDown) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        }
        if (this.data.hasNext || reset) {
            const db = wx.cloud.database()
            // 查询所有类别
            let skip = reset ? 0 : this.data.page * this.data.pageSize;
            db.collection('photos').orderBy('time', 'desc').skip(skip).limit(this.data.pageSize).get({
                success: res => {
                    let left = { list: [], height: 0 };
                    let right = { list: [], height: 0 };
                    if (res.data) {
                        let list = reset ? res.data : this.data.list.concat(res.data)
                        list.forEach(item => {
                            if (left.height > right.height) {
                                right.height = right.height + item.viewH;
                                right.list.push(item);
                            } else {
                                left.height = left.height + item.viewH;
                                left.list.push(item);
                            }
                        });
                        this.setData({
                            list: list,
                            listL: left.list,
                            listR: right.list,
                            page: reset ? 1 : (res.data.length < 20 ? this.data.page : this.data.page + 1),
                            hasNext: res.data.length === 20
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '查询记录失败'
                    })
                },
                complete: () => {
                    if (isPullDown) {
                        this.setData({
                            loading: false
                        });
                        wx.stopPullDownRefresh()
                    }
                }
            })
        }
    },
    selectImage() {
        if (app.globalData.hasLocPerm) {
            wx.getLocation({
                type: 'gcj02',
                success: res => {
                    this.setData({
                        location: res
                    });
                }
            })
        }
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                this.setData({
                    infoShown: true,
                    chooseInfo: {
                        filePath: res.tempFilePaths[0],
                        cloudPath: Date.now() + res.tempFilePaths[0].match(/\.[^.]+?$/)[0]
                    }
                });
            }
        })
    },
    doUpload(e) {
        let info = e.detail;
        if (this.data.chooseInfo) {
            wx.showLoading({
                title: '正在上传...',
            })
            wx.cloud.uploadFile({
                cloudPath: this.data.chooseInfo.cloudPath,
                filePath: this.data.chooseInfo.filePath,
                success: file => {
                    wx.showLoading({
                        title: '解析图片...',
                    })
                    wx.getImageInfo({
                        src: file.fileID,
                        success: image => {
                            let params = {
                                name: info.name,
                                src: file.fileID,
                                time: new Date(),
                                width: image.width,
                                height: image.height,
                                viewH: Math.round(image.height * 1000 / image.width),
                                type: image.type
                            };
                            if (info.tag) {
                                params.tag = info.tag;
                            }
                            if (info.location) {
                                params.location = this.data.location;
                            }
                            this.savePhoto(params);
                        },
                        fail() {
                            wx.hideLoading()
                        }
                    })
                },
                fail() {
                    wx.hideLoading()
                    wx.showToast({
                        icon: 'none',
                        title: '上传失败',
                    })
                },
                complete: () => {
                    this.setData({
                        chooseInfo: null
                    });
                }
            })
        } else {
            wx.showToast({
                title: '没有选择图片，无法上传',
            })
        }
    },
    savePhoto(params) {
        wx.showLoading({
            title: '信息存储中',
        })
        const db = wx.cloud.database()
        db.collection('photos').add({
            data: params
        }).then(res => {
            wx.showToast({
                icon: 'none',
                title: '上传成功'
            })
            this.closeInfo();
            this.onQuery(true);
            wx.hideLoading();
        }, () => {
            wx.hideLoading();
        });
    },
    previewImage(e) {
        wx.showLoading({
            title: '预览加载中'
        })
        let current = e.currentTarget.dataset.item;
        let list = this.data.list.map(item => { return item.src; });
        wx.previewImage({
            urls: list,
            current: current.src,
            complete() {
                wx.hideLoading()
            }
        })
    },
    showRemove(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        let pos = e.currentTarget.dataset.pos;
        item.showDel = true;
        let list = pos === 0 ? this.data.listL : this.data.listR;
        list.splice(index, 1, item);
        let params = pos === 0 ? { listL: list } : { listR: list };
        params.delIndex = index;
        params.delPos = pos === 0 ? 'listL' : 'listR';
        this.setData(params);
    },
    closeOptions() {
        if (this.data.delIndex > -1 && this.data.delPos) {
            let index = this.data.delIndex;
            let delPos = this.data.delPos;
            let list = this.data[delPos];
            let item = list[index];
            delete item.showDel;
            list.splice(index, 1, item);
            let params = {};
            params[delPos] = list;
            params.delIndex = -1;
            params.delPos = '';
            this.setData(params);
        }
    },
    doDelete(e) {
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        wx.showLoading({
            title: '删除文件中',
        })
        wx.cloud.deleteFile({
            fileList: [item.src],
            success: res => {
                let fileRes = res.fileList[0];
                if (fileRes.status === 0) {
                    const db = wx.cloud.database()
                    wx.showLoading({
                        title: '删除记录中',
                    })
                    db.collection('photos').doc(item._id).remove({
                        success: () => {
                            wx.hideLoading();
                            wx.showToast({
                                icon: 'none',
                                title: '删除成功'
                            })
                            this.onQuery(true);
                        }
                    });
                } else {
                    console.error(fileRes.errMsg);
                    wx.hideLoading();
                }
            },
            fail: console.error,
            complete: () => {
                this.closeOptions();
            }
        });
    },
    showLocation(e) {
        let location = e.currentTarget.dataset.loc;
        console.log(location);
        wx.openLocation({
            latitude: location.latitude,
            longitude: location.longitude
        })
    },
    closeInfo() {
        this.setData({
            infoShown: false,
            chooseInfo: null
        });
    }
})