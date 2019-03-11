import * as echarts from '../../ec-canvas/echarts';

const initChart = (canvas, width, height) => {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);
    var option = {
        backgroundColor: "#fff",
        color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
        series: [{
            label: {
                normal: {
                    fontSize: 14
                }
            },
            type: 'pie',
            center: ['50%', '50%'],
            radius: [0, '60%'],
            data: [{
                value: 55,
                name: '餐饮'
            }, {
                value: 20,
                name: '生活'
            }, {
                value: 10,
                name: '交通'
            }, {
                value: 20,
                name: '购物'
            }, {
                value: 38,
                name: '其他'
            }],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 2, 2, 0.3)'
                }
            }
        }]
    };
    chart.setOption(option);
    return chart;
}
Page({
    data: {
        active: false,
        ec: {
            onInit: initChart
        }
    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                current: 1,
                centerAvaliable: true
            })
        }
    },
    centerClick() {
        this.getTabBar().setData({
            centerClicked: !this.data.active
        })
        this.setData({
            active: !this.data.active
        });
    }
})