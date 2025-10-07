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
      chart: null,
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
    setOptions({ head ,title, yesterday_order, today_order } = {}) {
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
        legend: {},
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
            name: '费用(元)',
          },
        ],
        series: [
          {
            name: '昨日费用',
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
            name: '今日费用',
            type: 'bar',
            barWidth: 30,
            emphasis: {
              focus: 'series'
            },
            label: {
              show: true,
              position: 'top'
            },
            data: today_order
          }
        ]
      })
    }
  }
}
</script>
