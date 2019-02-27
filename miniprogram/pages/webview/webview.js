Page({
    data: {
        url: ''
    },
    onLoad(options) {
        let url = options.url || 'https://uglifan.cn';
        this.setData({
            url: url
        });
    }
})