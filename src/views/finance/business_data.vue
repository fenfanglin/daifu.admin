<template>
	<div class="dashboard-editor-container">
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<order-bar-chart :chart-data="orderBarCharData" />
		</el-row>
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<fee-bar-chart :chart-data="feeBarCharData" />
		</el-row>
	</div>
</template>

<script>
import OrderBarChart from '../dashboard/OrderBarChart.vue'
import feeBarChart from '../dashboard/FeeBarChart.vue'

export default {
	name: 'finance_business_data',
	components: {
		OrderBarChart,
		feeBarChart,
	},
	data() {
		return {
			orderBarCharData: {},
			feeBarCharData: {}
		}
	},
	created() {
		this.getList();
	},
	methods: {
		getList() {
			let that = this
			
			that.loading = true
			that.request({
				url: 'finance/business_data'
			}).then(res => {
				that.orderBarCharData = {head:'今日通道订单',title:res.data.title_order,yesterday_order:res.data.yesterday_order,today_order:res.data.today_order,today_rate:res.data.today_rate,yesterday_rate:res.data.yesterday_rate}
				that.feeBarCharData = {head:'今日通道费用',title:res.data.title_fee,yesterday_order:res.data.yesterday_fee,today_order:res.data.today_fee}
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

@media (max-width:1024px) {
	.chart-wrapper {
		padding: 8px;
	}
}
</style>
