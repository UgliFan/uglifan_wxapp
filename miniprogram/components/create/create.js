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
        inputAction: '',
        input: {
            summary: '0.00'
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
                            listViewH: 'auto'
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
                current: item.value
            });
            this.getCategories();
        },
        selectCategory(e) {
            let item = e.currentTarget.dataset.item;
            this.setData({
                select: item,
                inputShow: true
            });
            this.setViewHeight();
        },
        keyBoardPress(e) {
            let value = e.currentTarget.dataset.value;
            if (value === 'date') {

            } else if (value === 'del') {
                this.setData({
                    input: {
                        action: this.data.input.action,
                        summary: this.data.input.summary.substr(0, this.data.input.summary.length - 1)
                    }
                });
            } else if (value === 'add') {
                let input = this.data.input;
                input.action = value;
                this.setData({
                    input: input
                });
            } else if (value === 'min') {
                let input = this.data.input;
                input.action = value;
                this.setData({
                    input: input
                });
            } else {
                let summary = '';
                if (this.data.input.summary === '0.00' || this.data.input.summary === '0') {
                    summary = value;
                } else {
                    summary = this.data.input.summary + value;
                }
                this.setData({
                    input: {
                        action: '',
                        summary: summary
                    }
                });
            }
        }
    }
})
