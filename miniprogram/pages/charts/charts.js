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
    setPieOption(title, result) {
        let list = result.outList || result;
        const legend = list.map(item => { return item.name; })
        let options = {
            title: {
                text: title,
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
                    formatter: '{b}:￥{c}',
                    fontSize: 14
                },
                emphasis: {
                    label: { formatter: '{b}:{d}%' }
                },
                type: 'pie',
                radius: '45%',
                center: ['50%', '50%'],
                data: list
            }]
        }
        this.renderChart(options)
    },
    setBarOption(result) {
        let list = result.outList || result;
        const xAxis = list.map(item => {
            return item.name.split('/')[2];
        });
        let inValues = {};
        result.inList.map(item => {
            let key = item.name.split('/')[2];
            inValues[key] = item.value;
        });
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
            color: ['#67C23A', '#F56C6C'],
            legend: {
                data: ['支出', '收入']
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
                name: '支出',
                data: list.map(item => { return item.value; })
            }, {
                label: {
                    normal: {
                        show: true,
                        color: '#222',
                        position: 'right'
                    }
                },
                type: 'bar',
                name: '收入',
                data: xAxis.map(item => {
                    if (inValues[item]) {
                        return inValues[item];
                    } else {
                        return 0;
                    }
                })
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
        let params = {
            y: year,
            m: month
        };
        if (type === 1) params.id = app.globalData.openId;
        wx.request({
            url: `https://uglifan.cn/api/chart/${chartType}`,
            data: params,
            success: response => {
                let res = response.statusCode === 200 && response.data ? response.data : {};
                if (res.code === 0) {
                    let result = res.result || { outList: [], inList: [] };
                    if (chartType === 'pie') {
                        this.setPieOption('分类比例统计', result)
                    } else if (chartType === 'bar') {
                        this.setBarOption(result)
                    } else if (chartType === 'all') {
                        let list = [];
                        for (let key in result) {
                            if (key && result.hasOwnProperty(key) && result[key]) {
                                if (key === 'inCount') {
                                    list.push({
                                        name: '总收入',
                                        value: (result[key] / 100)
                                    });
                                } else {
                                    list.push({
                                        name: '总支出',
                                        value: (result[key] / 100)
                                    });
                                }
                            }
                        }
                        this.setPieOption('总收入支出比', list);
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
        console.log(params);
        if (chart) chart.clear()
        this.getChartData(params.y, params.m, params.type, params.chart)
    }
})