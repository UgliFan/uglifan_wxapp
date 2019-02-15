const app = getApp();

Page({
    data: {
        infoShown: false,
        chooseInfo: null,
        canvasSize: {
            height: 0
        },
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
                wx.showLoading({
                    title: '解析中...',
                })
                let fileSize = res.tempFiles[0].size;
                wx.getImageInfo({
                    src: res.tempFilePaths[0],
                    success: image => {
                        let imgW = image.width
                        let imgH = image.height
                        let cs = Math.round(image.height * 750 / image.width)
                        this.setData({
                            canvasSize: cs
                        })
                        if (fileSize > 1048576) {
                            wx.showLoading({
                                title: '压缩中...',
                            })
                            const ctx = wx.createCanvasContext('myCanvas', this)
                            let scale = Math.floor(1048576 / fileSize * 10) / 10
                            ctx.drawImage(res.tempFilePaths[0], 0, 0, imgW, imgH, 0, 0, 750, cs)
                            ctx.draw(false, () => {
                                wx.canvasToTempFilePath({
                                    canvasId: 'myCanvas',
                                    fileType: 'jpg',
                                    success: scaleRes => {
                                        this.setData({
                                            infoShown: true,
                                            chooseInfo: {
                                                filePath: scaleRes.tempFilePath,
                                                width: imgW,
                                                height: imgH,
                                                viewH: Math.round(imgH * 1000 / imgW),
                                                type: 'jpg'
                                            }
                                        })
                                        wx.hideLoading()
                                    },
                                    fail() {
                                        wx.showToast({
                                            title: '压缩失败'
                                        })
                                        wx.hideLoading()
                                    }
                                })
                            })
                        } else {
                            this.setData({
                                infoShown: true,
                                chooseInfo: {
                                    filePath: res.tempFilePaths[0],
                                    width: imgW,
                                    height: imgH,
                                    viewH: Math.round(imgH * 1000 / imgW),
                                    type: image.type
                                }
                            })
                            wx.hideLoading()
                        }
                    },
                    fail() {
                        wx.showToast({
                            title: '解析失败'
                        })
                        wx.hideLoading()
                    }
                })
            }
        })
    },
    doUpload(e) {
        if (this.data.chooseInfo) {
            wx.showLoading({
                title: '正在上传...',
            })
            wx.cloud.uploadFile({
                cloudPath: e.detail.name,
                filePath: this.data.chooseInfo.filePath,
                success: file => {
                    let params = {
                        name: e.detail.name,
                        src: file.fileID,
                        time: new Date(),
                        width: this.data.chooseInfo.width,
                        height: this.data.chooseInfo.height,
                        viewH: this.data.chooseInfo.viewH,
                        type: this.data.chooseInfo.type
                    };
                    if (e.detail.tag) {
                        params.tag = e.detail.tag;
                    }
                    if (e.detail.location) {
                        params.location = this.data.location;
                    }
                    this.savePhoto(params);
                },
                fail() {
                    wx.hideLoading()
                    wx.showToast({
                        icon: 'none',
                        title: '上传失败',
                    })
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
            canvasSize: 0,
            infoShown: false,
            chooseInfo: null
        });
    }
})