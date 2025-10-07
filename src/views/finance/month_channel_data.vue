<template>
	<div class="dashboard-editor-container">
		<el-table
			:data="tableData"
			border
			style="width: 100%"
		>
			<template v-for="(item, index) in tableHeader">
				<el-table-column
					:prop="item.field"
					:key="item.channel_id"
					align="center"
				>
					<template
						#header
					>
						<div @click="setCurrent(item.channel_id,index)" class="pointer" :class="item.class">
							<span>{{ item.channel }}</span>
						</div>
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
	name: 'finance_month_channel_data',
	components: {
		LineChart
	},
	data() {
		return {
			lineChartData: {},
			tableHeader: [],
			tableData: [
				{x_type: '订单', x101: 1, x102: 6, x103: 5, x105: 6, x106: 8, x108: 9, x112: 3, x122: 2, x123: 6, x124: 4 },
				{x_type: '费用', x101: 1, x102: 6, x103: 5, x105: 6, x106: 8, x108: 9, x112: 3, x122: 2, x123: 6, x124: 4 }
			],
			list: []
		}
	},
	created() {
		this.getList()
	},
	methods: {
		setCurrent(channel_id) {
			if (channel_id > 0) {
				this.lineChartData.list = []
				var temp = []
				var data = this.list
				data.forEach((item) => {
					if (item.channel_id === channel_id) {
						temp.push(item)
					}
				})
				this.lineChartData.list = temp
				var old_data = this.tableHeader
				var that = this
				old_data.forEach((item, index) => {
					if (channel_id !== item.channel_id) {
						that.$set(that.tableHeader[index],'class','')
					} else {
						that.$set(that.tableHeader[index],'class','selectedChannel')
						that.lineChartData.head = '本月' + item.channel + '订单/费用'
					}
				})
				console.log(this.tableHeader)
			}
		},
		getList() {
			let that = this
			
			that.loading = true
			that.request({
				url: 'finance/month_channel_data'
			}).then(res => {
				that.lineChartData = {
					head: '本月支付宝小荷包订单/费用',
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
