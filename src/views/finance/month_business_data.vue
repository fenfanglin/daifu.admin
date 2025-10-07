<template>
	<div class="dashboard-editor-container">
		<el-table
			:data="tableData"
			border
			style="width: 100%"
		>
			<template v-for="(item) in tableHeader">
				<el-table-column
					:prop="item.field"
					:key="item.business_id"
					align="center"
				>
					<template #header>
						<div @click="setCurrent(item.business_id)" class="pointer" :class="{selectedBusiness:item.class}">
							<span>{{ item.business }}</span></div>
					</template>
				</el-table-column>
			</template>
		</el-table>
		<el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<line-chart :chart-data="lineChartData"/>
		</el-row>
	</div>
</template>

<script>
import LineChart from '../dashboard/MonthAisleLineChart'

export default {
	name: 'finance_month_business_data',
	components: {
		LineChart
	},
	data() {
		return {
			i:-1,
			lineChartData: {},
			tableHeader: [],
			tableData: [],
			list: []
		}
	},
	created() {
		this.getList()
	},
	methods: {
		setCurrent(business_id) {
			if (business_id > 0) {
				this.lineChartData.list = []
				var temp = []
				var data = this.list
				data.forEach((item) => {
					if (item.business_id === business_id) {
						temp.push(item)
					}
				})
				this.lineChartData.list = temp
				var old_data = this.tableHeader
				var that = this
				old_data.forEach((item, index) => {
					if (business_id !== item.business_id) {
						that.$set(that.tableHeader[index],'class',false)
					} else {
						that.$set(that.tableHeader[index],'class',true)
						that.lineChartData.head = '本月' + item.business + '订单/费用'
					}
				})
			}
			this.$forceUpdate();
		},
		getList() {
			let that = this
			
			that.loading = true
			that.request({
				url: 'finance/month_business_data'
			}).then(res => {
				that.lineChartData = {
					head: '本月订单/费用',
					title: res.data.title,
					list: res.data.show_list
				}
				that.tableHeader = res.data.tableHeader
				that.tableData = res.data.tableData
				that.list = res.data.list
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.selectedBusiness {
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
