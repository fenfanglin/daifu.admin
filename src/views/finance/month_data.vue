<template>
	<div class="dashboard-editor-container">
		<panel-group :chart-data="monthData"/>
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<line-chart :chart-data="lineChartData"/>
		</el-row>
	</div>
</template>

<script>
import PanelGroup from '../dashboard/MonthPanelGroup'
import LineChart from '../dashboard/WeekLineChart'

export default {
	name: 'finance_month_data',
	components: {
		LineChart,
		PanelGroup
	},
	data() {
		return {
			lineChartData: {},
			monthData: {}
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
				url: 'finance/month_data'
			}).then(res => {
				that.lineChartData = {
					head: '本月订单/费用',
					title: res.data.title,
					total_order: res.data.total_order,
					total_fee: res.data.total_fee
				}
				that.monthData = {
					last_month_order: res.data.last_month_order,
					last_month_fee: res.data.last_month_fee,
					month_order: res.data.month_order,
					month_fee: res.data.month_fee
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
