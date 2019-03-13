import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
let chart = null
Page({
    data: {
        active: false,
        styleStr: '',
        isX: false,
        ec: {
            lazyLoad: true
        }
    },
    onLoad() {
        this.echartsComponnet = this.selectComponent('#chart')
        const nav = app.globalData.nav
        const sysInfo = app.globalData.sysInfo
        this.setData({
            isX: sysInfo.isX,
            styleStr: `height:${sysInfo.screenHeight - nav.paddingTop - nav.height}px`
        })
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
            color: ['#F56C6C', '#E6A23C', '#67C23A', '#909399', '#409EFF', '#4f9d9d', '#FFCC99', '#996699', '#333333', '#949449', '#984b4b', '#ae00ae', '#ae8f00'],
            legend: {
                x: 'center',
                y: 'bottom',
                data: legend
            },
            series: [{
                avoidLabelOverlap: true,
                label: {
                    position: 'outside',
                    formatter: '{b}\n{d}%',
                    fontSize: 14
                },
                emphasis: {
                    label: {
                        formatter: '{b}\n￥{c}'
                    }
                },
                labelLine: {
                    smooth: true
                },
                type: 'pie',
                radius: '45%',
                center: ['50%', '50%'],
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
        this.initChart(options)
    },
    initChart(options) {
        if (chart) {
            chart.clear()
            chart.setOption(options)
        } else {
            this.echartsComponnet.init((canvas, width, height) => {
                chart = echarts.init(canvas, null, {
                    width, height
                })
                canvas.setChart(chart)
                chart.setOption(options)
                return chart
            })
        }
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
        if (params.chart === 'pie') {
            this.getPie(params.y, params.m, params.type, params.chart)
        } else {
            chart.clear()
        }
    }
})