<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ head, title, yesterday_order, today_order, today_rate, yesterday_rate } = {}) {
      this.chart.setOption({
        title: {
          text: head
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: { data: ['昨日订单数', '今日订单数', '昨日成功率', '今日成功率'] },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: title
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '成功订单数'
          },
          {
            type: 'value',
            name: '百分比',
            axisLabel: {
              formatter: '{value} %'
            }
          }
        ],
        series: [
          {
            name: '昨日订单数',
            type: 'bar',
            barWidth: 30,
            emphasis: {
              focus: 'series'
            },
            label: {
              show: true,
              position: 'top'
            },
            data: yesterday_order
          },
          {
            name: '今日订单数',
            type: 'bar',
            barWidth: 30,
            emphasis: {
              focus: 'series'
            },
            label: {
              show: true,
              position: 'top'
            },
            tooltip: {
              valueFormatter: function(value) {
                return value + ' ml'
              }
            },
            data: today_order
          },
          {
            name: '昨日成功率',
            type: 'line',
            yAxisIndex: 1,
            data: yesterday_rate
          },
          {
            name: '今日成功率',
            type: 'line',
            yAxisIndex: 1,
            data: today_rate
          }
        ]
      })
    }
  }
}
</script>
