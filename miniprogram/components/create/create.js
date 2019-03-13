const app = getApp();

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        listViewH: 'auto',
        shown: false,
        anime: false,
        inputShow: false,
        tabs: [{
            value: 0,
            label: '支出'
        }, {
            value: 1,
            label: '收入'
        }],
        current: 0,
        categories: [],
        id: null,
        select: null,
        location: null,
        inputRemark: '',
        input: {
            date: '',
            dateShow: '',
            action: '',
            showEqual: false,
            summary: '0',
            dotted: false,
            fu: false
        },
        isX: false,
        statHeight: 20,
        headerHeight: 44,
        navHeight: 64
    },
    properties: {
        data: {
            type: Object,
            value: null,
            observer(newValue) {
                this.setData({
                    modify: newValue
                });
            }
        },
        show: {
            type: Boolean,
            value: false,
            observer(newValue) {
                if (newValue) {
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
                    let modify = this.data.modify
                    if (modify) {
                        let date = modify.date.split(' ')[0]
                        this.setData({
                            shown: newValue,
                            id: modify.id,
                            inputShow: true,
                            inputRemark: modify.remark || '',
                            select: modify.cid,
                            current: modify.type,
                            input: {
                                date: date.replace(/\//g, '-'),
                                dateShow: date.replace(/-/g, '/'),
                                action: '',
                                showEqual: false,
                                summary: modify.summary,
                                dotted: false,
                                fu: false
                            }
                        })
                    } else {
                        this.setData({
                            shown: newValue
                        })
                    }
                    this.getCategories()
                    let timer = setTimeout(() => {
                        this.setData({
                            anime: newValue
                        })
                        this.setViewHeight()
                        clearTimeout(timer)
                    }, 20)
                } else {
                    this.setData({
                        anime: newValue
                    })
                    let timer = setTimeout(() => {
                        this.setData({
                            shown: newValue,
                            id: null,
                            current: 0,
                            select: null,
                            inputShow: false,
                            listViewH: 'auto',
                            inputRemark: '',
                            input: {
                                date: '',
                                dateShow: '',
                                action: '',
                                showEqual: false,
                                summary: '0',
                                dotted: false,
                                fu: false
                            }
                        })
                        clearTimeout(timer)
                    }, 300)
                }
            }
        }
    },
    lifetimes: {
        attached() {
            const sysInfo = app.globalData.sysInfo
            const nav = app.globalData.nav
            this.setData({
                isX: sysInfo.isX,
                statHeight: nav.paddingTop,
                headerHeight: nav.height,
                navHeight: nav.paddingTop + nav.height
            })
        }
    },
    methods: {
        setViewHeight() {
            let query = this.createSelectorQuery();
            let className = this.data.inputShow ? '.category-list-small' : '.category-list-large';
            query.select(className).boundingClientRect().exec(res => {
                let rect = res[0];
                if (rect) {
                    this.setData({
                        listViewH: `${rect.height}px`
                    });
                }
            })
        },
        getCategories() {
            wx.request({
                url: 'https://www.uglifan.cn/api/category/list',
                data: {
                    type: this.data.tabs[this.data.current].value
                },
                method: 'GET',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        this.setData({
                            categories: res.result || []
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '分类获取失败'
                        })
                    }
                },
                fail: () => {
                    wx.showToast({
                        icon: 'none',
                        title: '分类获取失败.'
                    })
                }
            })
        },
        close(e) {
            const noReload = e && e.type === 'tap';
            this.triggerEvent('close', !noReload);
        },
        selectTab(e) {
            let item = e.currentTarget.dataset.item;
            this.setData({
                current: item.value,
                inputShow: false,
                inputRemark: '',
                input: {
                    date: '',
                    dateShow: '',
                    action: '',
                    showEqual: false,
                    summary: '0',
                    dotted: false,
                    fu: false
                },
                select: null
            });
            this.setViewHeight();
            this.getCategories();
        },
        selectCategory(e) {
            let item = e.currentTarget.dataset.item;
            let input = this.data.input;
            if (!input.date) {
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                if (month < 10) month = `0${month}`;
                if (day < 10) day = `0${day}`;
                input.dateShow = `${year}/${month}/${day}`;
                input.date = `${year}-${month}-${day}`;
            }
            this.setData({
                select: item.id,
                inputShow: true,
                input: input
            });
            this.setViewHeight();
        },
        keyBoardDate(e) {
            let dateShow = e.detail.value;
            let input = this.data.input;
            input.date = e.detail.value;
            input.dateShow = input.date.replace(/-/g, '/');
            this.setData({ input });
        },
        keyBoardPress(e) {
            let value = e.currentTarget.dataset.value;
            let input = this.data.input;
            if (value === 'del') {
                input.summary = input.summary.substr(0, input.summary.length - 1);
                if ((input.fu && input.summary === '-') || !input.summary) {
                    input.fu = false;
                    input.summary = '0';
                    input.action = '';
                }
                if (input.action) {
                    if (input.summary.indexOf(input.action) < 0) input.action = '';
                }
                let b = input.action ? input.summary.split(input.action)[1] : input.summary;
                input.dotted = b && b.indexOf('.') > -1;
            } else {
                let summary = '';
                if (value === '+' || value === '-' || value === '=') {
                    if (input.action) {
                        let temp = input.fu ? input.summary.substr(1, input.summary.length - 1) : input.summary;
                        let summarys = temp.split(input.action);
                        let a = Math.floor(Number(summarys[0]) * 100);
                        if (input.fu) a = 0 - a;
                        let b = Math.floor(Number(summarys[1]) * 100);
                        let c = (input.action === '+' ? (a + b) : (a - b)) / 100;
                        input.fu = c < 0;
                        summary = c.toString();
                    } else {
                        summary = input.summary;
                    }
                    if (value === '=') {
                        input.action = '';
                        input.summary = summary;
                        input.dotted = summary.indexOf('.') > -1;
                    } else {
                        input.action = value;
                        input.summary = summary + value;
                        input.dotted = false;
                    }
                } else if (value === '.') {
                    if (input.action) {
                        let b = input.summary.split(input.action)[1];
                        if (b && b.indexOf(value) > -1) return;
                    } else if (input.summary.indexOf(value) > -1) {
                        return;
                    }
                    input.summary = input.summary + value;
                    input.dotted = true;
                } else {
                    if (input.summary === '0') {
                        summary = value;
                    } else if (input.dotted) {
                        let b = input.action ? input.summary.split(input.action)[1] : input.summary;
                        if (b && b.indexOf('.') === b.length - 3) {
                            return;
                        } else {
                            summary = input.summary + value;
                        }
                    } else {
                        summary = input.summary + value;
                    }
                    input.summary = summary;
                }
            }
            input.showEqual = input.action && input.summary.indexOf(input.action) < input.summary.length - 1;
            this.setData({
                input: input
            });
        },
        keyBoardFinish(e) {
            if (this.data.input.summary === '0') {
                wx.showModal({
                    title: '警告',
                    content: '提交前请输入金额！',
                    showCancel: false,
                    confirmText: '知道了'
                });
            } else {
                wx.showLoading({
                    title: '账单保存中'
                })
                let form = e.detail.value;
                let ym = this.data.input.date.substr(0, 7).replace('-', '_');
                let coltName = `tally_${ym}`;
                let date = `${this.data.input.dateShow} 00:00:00`
                if (this.data.id) {
                    this.updateTally(form, date)
                } else {
                    this.saveTally(form, date)
                }
            }
        },
        updateTally(form, date) {
            let params = {
                id: this.data.id,
                cid: this.data.select,
                date: date,
                summary: this.data.input.summary,
                remark: form.remark
            };
            wx.request({
                url: 'https://uglifan.cn/api/tally/modify',
                data: params,
                header: {
                    'content-type': 'application/x-www-form-urlencoded',
                    cookie: `__source_op=${app.globalData.openId || ''}`
                },
                method: 'POST',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        this.close()
                        wx.showToast({
                            icon: 'success',
                            title: '修改账单成功'
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: res.message || '未知错误'
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: err.message || '未知错误.'
                    })
                },
                complete: () => {
                    wx.hideLoading()
                }
            });
        },
        saveTally(form, date) {
            let params = {
                open_id: app.globalData.openId,
                cid: this.data.select,
                date: date,
                summary: this.data.input.summary,
                remark: form.remark
            };
            if (this.data.location) {
                params.latitude = this.data.location.latitude || '';
                params.longitude = this.data.location.longitude || '';
            }
            wx.request({
                url: 'https://uglifan.cn/api/tally/create',
                data: params,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                success: response => {
                    let res = response.statusCode === 200 && response.data ? response.data : {};
                    if (res.code === 0) {
                        wx.showToast({
                            icon: 'success',
                            title: '添加账单成功'
                        })
                        this.close();
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: res.message || '未知错误'
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: err.message || '未知错误.'
                    })
                },
                complete: () => {
                    wx.hideLoading()
                }
            });
        }
    }
})
