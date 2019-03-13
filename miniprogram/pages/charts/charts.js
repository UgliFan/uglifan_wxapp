import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
const colors = ['#F56C6C', '#E6A23C', '#67C23A', '#909399', '#409EFF', '#4f9d9d', '#FFCC99', '#996699', '#333333', '#949449', '#984b4b', '#ae00ae', '#ae8f00'];
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
                left: 20,
                top: 10,
                textStyle: {
                    fontSize: 18,
                    color: '#222'
                }
            },
            backgroundColor: "#fff",
            color: colors,
            legend: {
                x: 'center',
                y: 'bottom',
                data: legend
            },
            series: [{
                avoidLabelOverlap: true,
                label: {
                    position: 'outside',
                    formatter: '{b}:{d}%',
                    fontSize: 14
                },
                emphasis: {
                    label: { formatter: '{b}:￥{c}' }
                },
                type: 'pie',
                radius: '45%',
                center: ['50%', '50%'],
                data: list
            }]
        }
        this.renderChart(options)
    },
    setBarOption(list) {
        const xAxis = list.map(item => {
            return item.name.split('/')[2];
        })
        let options = {
            title: {
                text: '按天统计',
                left: 20,
                top: 10,
                textStyle: {
                    fontSize: 18,
                    color: '#222'
                }
            },
            backgroundColor: "#fff",
            color: colors,
            legend: {
                data: xAxis
            },
            yAxis: [{
                type: 'category',
                data: xAxis,
                axisTick: {
                    alignWithLabel: true
                }
            }],
            xAxis: [{ type: 'value' }],
            grid: {
                top: 40,
                left: 20,
                right: 20,
                bottom: 10,
                containLabel: true
            },
            series: [{
                label: {
                    normal: {
                        show: true,
                        color: '#222',
                        position: 'right'
                    }
                },
                type: 'bar',
                barWidth: '60%',
                data: list.map(item => { return item.value; })
            }]
        }
        this.renderChart(options)
    },
    renderChart(options) {
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
    getChartData(year, month, type = 0, chartType) {
        wx.request({
            url: `https://uglifan.cn/api/chart/${chartType}`,
            data: {
                y: year,
                m: month,
                type: type
            },
            success: response => {
                let res = response.statusCode === 200 && response.data ? response.data : {}
                if (res.code === 0) {
                    let list = res.result || []
                    if (chartType === 'pie') {
                        this.setPieOption(list)
                    } else if (chartType === 'bar') {
                        this.setBarOption(list)
                    }
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
        if (chart) chart.clear()
        this.getChartData(params.y, params.m, params.type, params.chart)
    }
})