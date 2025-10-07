<template>
	<div class="dashboard-editor-container">
		<panel-group :chart-data="weekData"/>
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<line-chart :chart-data="lineChartData"/>
		</el-row>
	</div>
</template>

<script>
import LineChart from '../dashboard/WeekLineChart'
import PanelGroup from '../dashboard/WeekPanelGroup.vue'

export default {
	name: 'finance_week_data',
	components: {
		PanelGroup,
		LineChart
	},
	data() {
		return {
			lineChartData: {},
			weekData: {}
		}
	},
	created() {
		this.getList()
	},
	methods: {
		getList() {
			let that = this

			that.loading = true
			that.request({
				url: 'finance/week_data'
			}).then(res => {
				that.lineChartData = {
					head: '近7天订单/费用',
					title: res.data.title,
					total_order: res.data.total_order,
					total_fee: res.data.total_fee
				}
				that.weekData = {
					last_week_order: res.data.last_week_order,
					last_week_fee: res.data.last_week_fee,
					week_order: res.data.week_order,
					week_fee: res.data.week_fee
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
	padding: 32px;
	background-color: rgb(240, 242, 245);
	position: relative;

	.chart-wrapper {
		background: #fff;
		padding: 16px 16px 0;
		margin-bottom: 32px;
	}
}

@media (max-width: 1024px) {
	.chart-wrapper {
		padding: 8px;
	}
}
</style>
