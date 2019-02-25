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
            label: '收入'
        }, {
            value: 1,
            label: '支出'
        }],
        current: 0,
        categories: [],
        select: {},
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
        }
    },
    /**
     * 组件的属性列表
     */
    properties: {
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
                    this.setData({
                        shown: newValue
                    });
                    let timer = setTimeout(() => {
                        this.setData({
                            anime: newValue
                        });
                        this.setViewHeight();
                        clearTimeout(timer);
                    }, 50);
                } else {
                    this.setData({
                        anime: newValue
                    });
                    let timer = setTimeout(() => {
                        this.setData({
                            shown: newValue,
                            select: {},
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
                        });
                        clearTimeout(timer);
                    }, 300);
                }
            }
        }
    },
    lifetimes: {
        attached() {
            this.getCategories();
        },
        detached() {}
    },
    /**
     * 组件的方法列表
     */
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
            const db = wx.cloud.database()
            // 查询所有类别
            db.collection('categories').where({
                type: this.data.tabs[this.data.current].value
            }).get({
                success: res => {
                    this.setData({
                        categories: res.data
                    })
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '分类获取失败'
                    })
                }
            })
        },
        close() {
            this.triggerEvent('close');
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
                select: {}
            });
            this.setViewHeight();
            this.getCategories();
        },
        selectCategory(e) {
            let item = e.currentTarget.dataset.item;
            let input = this.data.input;
            let date = new Date()
            input.dateShow = date.toISOString().substr(0, 10).replace(/-/g, '/')
            input.date = input.dateShow.replace(/\//g, '-')
            this.setData({
                select: item,
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
                let form = e.detail.value;
                let ym = this.data.input.date.substr(0, 7).replace('-', '_');
                let coltName = `tally_${ym}`;
                let params = {
                    type: this.data.current,
                    select: this.data.select,
                    date: new Date(`${this.data.input.date} 00:00:00`).getTime(),
                    summary: Number(this.data.input.summary) * 100,
                    remark: form.remark
                };
                if (this.data.location) params.location = this.data.location;
                wx.cloud.callFunction({
                    name: 'addTally',
                    data: { coltName, params }
                }).then(res => {
                    let result = res.result || {};
                    if (result.code === 0) {
                        this.close();
                    }
                    wx.showToast({
                        title: result.message
                    })
                }).catch(console.error)
            }
        }
    }
})
