Component({
    options: {
        addGlobalClass: true
    },
    data: {
        shown: false,
        anime: false,
        tabs: [{
            value: 0,
            label: '收入'
        }, {
            value: 1,
            label: '支出'
        }],
        current: 0
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
                        clearTimeout(timer);
                    }, 50);
                } else {
                    this.setData({
                        anime: newValue
                    });
                    let timer = setTimeout(() => {
                        this.setData({
                            shown: newValue
                        });
                        clearTimeout(timer);
                    }, 300);
                }
            }
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        close() {
            this.triggerEvent('close');
        },
        selectTab(e) {
            let item = e.currentTarget.dataset.item;
            this.setData({
                current: item.value
            });
        }
    }
})
