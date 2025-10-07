<template>
	<div class="dashboard-editor-container">
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<line-chart :chart-data="lineBusinessChartData"/>
		</el-row>
	</div>
</template>

<script>
import LineChart from '../dashboard/MonthAllLineChart'

export default {
	name: 'finance_month_all_data',
	components: {
		LineChart
	},
	data() {
		return {
			lineBusinessChartData: {},
		}
	},
	created() {
		this.getAisle();
	},
	methods: {
		getAisle() {
			let that = this

			that.loading = true
			that.request({
				url: 'finance/month_all_business_data'
			}).then(res => {
				that.lineBusinessChartData = {
					head: '商户订单/费用',
					title: res.data.title,
					list: res.data.list,
					selected: res.data.selected
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.selectedChannel {
	background-color: #5ab1ef;
	color: #fff;
	border-color: #5ab1ef;
}

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
