import * as echarts from '../../ec-canvas/echarts';

let pieChart = null
Page({
    data: {
        active: false,
        ec: {
            lazyLoad: true
        }
    },
    onLoad() {
        this.echartsComponnet = this.selectComponent('#pieChart');
    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                current: 1,
                centerAvaliable: true
            })
        }
    },
    setPieOption(list) {
        const legend = list.map(item => { return item.name; })
        let options = {
            title: {
                text: '分类比例统计',
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16,
                    color: '#222'
                }
            },
            backgroundColor: "#fff",
            color: ["#F56C6C", "#E6A23C", "#67C23A", "#909399", "#409EFF", "#FFFF00", "#FFCC99", "#996699"],
            legend: {
                x: 'center',
                y: 'bottom',
                data: legend
            },
            series: [{
                label: {
                    normal: {
                        show: false,
                        position: 'center',
                        formatter: '{b}\n￥{c}\n{d}%',
                        fontSize: 14
                    },
                    emphasis: {
                        show: true
                    }
                },
                avoidLabelOverlap: false,
                type: 'pie',
                radius: ['40%', '60%'],
                data: list,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 2, 2, 0.3)'
                    }
                }
            }]
        }
        if (pieChart) {
            pieChart.clear()
            pieChart.setOption(options)
        } else {
            this.initPieChart(options)
        }
    },
    initPieChart(options) {
        this.echartsComponnet.init((canvas, width, height) => {
            pieChart = echarts.init(canvas, null, {
                width, height
            })
            canvas.setChart(pieChart)
            pieChart.setOption(options)
            return pieChart
        })
    },
    getPie(year, month, type = 0) {
        wx.request({
            url: 'https://uglifan.cn/api/chart/pie',
            data: {
                y: year,
                m: month,
                type: type
            },
            success: response => {
                let res = response.statusCode === 200 && response.data ? response.data : {}
                if (res.code === 0) {
                    let list = res.result || []
                    this.setPieOption(list)
                }
            }
        })
    },
    centerClick() {
        this.getTabBar().setData({
            centerClicked: !this.data.active
        })
        this.setData({
            active: !this.data.active
        })
    },
    pickerChange(e) {
        const params = e.detail
        this.getPie(params.y, params.m, params.type)
    }
})