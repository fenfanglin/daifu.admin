<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="商户id" clearable/>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-input v-model="queryParams.order_no" placeholder="订单号" clearable/>
			</el-form-item> -->
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.success_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="支付时间开始"
					end-placeholder="支付时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in rechargeStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['order:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		
		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<!-- <el-table-column label="订单号" prop="order_no" width="250" fixed="left" :show-overflow-tooltip="true" /> -->
			<el-table-column label="商户id" prop="business_id" width="110" />
			<el-table-column label="充值通道" prop="recharge_type_str" width="140" />
			<el-table-column label="充值账号" prop="account" :show-overflow-tooltip="true" width="350" />
			<el-table-column label="备注" prop="remark" />
			<el-table-column label="创建时间" prop="create_time" width="220" />
			<el-table-column label="支付时间" prop="success_time" width="220" />
			<el-table-column label="实付金额" prop="post_amount" width="120" />
			<el-table-column label="Usdt金额" prop="usdt_amount" width="120" />
			<el-table-column label="状态" width="130">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<!-- <el-table-column label="订单号" prop="order_no" width="250" :show-overflow-tooltip="true" /> -->
			<el-table-column label="商户id" prop="business_id" width="120" />
			<el-table-column label="充值通道" prop="recharge_type_str" width="150" />
			<el-table-column label="充值账号" prop="account" :show-overflow-tooltip="true" width="350" />
			<el-table-column label="创建时间" prop="create_time" width="200" />
			<el-table-column label="支付时间" prop="success_time" width="200" />
			<el-table-column label="实付金额" prop="post_amount" width="120" />
			<el-table-column label="Usdt金额" prop="usdt_amount" width="120" />
			<el-table-column label="状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
		</el-table>
		
		<pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/>
	</div>
</template>

<script>
export default {
	name: "finance_list_recharge", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			is_mobile: this.isMobile(),
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			
			// 是否显示弹出层
			open: false,
			openRecharge: false,
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				order_no: "",
				status: "",
				success_time: [],
			},
			// 表单参数
			title: "",
			form: {},
			detail: {},
			
			// 表单校验
			rules: {
				
			},
		}
	},
	computed: {
		rechargeStatus() {
			return this.$store.getters.rechargeStatus
		},
		rechargeType() {
			return this.$store.getters.rechargeType
		},
	},
	created() {
		this.getUserInfo();
		this.getList();
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "recharge/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.loading = false;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			this.openRecharge = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {}
			
			this.resetForm("form");
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.page = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.queryParams = {
				page: 1,
				limit: this.queryParams.limit,
				keyword: "",
				status: "",
				center_id: "",
				success_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		handleView(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "recharge/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.detail = res.data;
				that.openDetail = true;
			});
		},
		handleEditRecharge() {
			let that = this
			
			that.reset();
			that.openRecharge = true;
		},
		submitFormRecharge: function() {
			let that = this
			
			that.request({
				url: "recharge_usdt/pay",
				data: that.form,
			}).then(res => {
				if (res.code == 200) {
					that.cancel()
					window.open(res.data.pay_url, '_blank')
					this.getList()
				}
			});
		},
		
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("recharge/export", this.queryParams, "充值").then(res => {
				
			});
		},
	}
};
</script>
<style lang="scss">
.panel-group-recharge {
	.card-panel-col {
		margin-bottom: 32px;
	}
	
	.card-panel {
		position: relative;
		display: flex;
		// cursor: pointer;
		font-size: 12px;
		overflow: hidden;
		color: #666;
		background: #f6faff;
		// box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
		// border-color: rgba(0, 0, 0, .05);
		border: 0;
		border-radius: 5px;
		
		.card-panel-description {
			position: relative;
			float: left;
			text-align: left;
			margin: 35px;
			width: 100%;
			
			.card-panel-num {
				font-size: 30px;
				margin-bottom: 30px;
			}
			
			.card-panel-text {
				line-height: 18px;
				color: rgba(0, 0, 0, 0.45);
				font-size: 16px;
			}
			
			.card-panel-btn {
				position: absolute;
				bottom: -8px;
				right: 0;
			}
		}
	}
}

@media (max-width:550px) {
	.card-panel-description {
		display: none;
	}
	
	.card-panel-icon-wrapper {
		float: none !important;
		width: 100%;
		height: 100%;
		margin: 0 !important;
	}
}

.recharge_logo {
	text-align: center;
	margin-bottom: 40px;
	
	img {
		width: 150px;
	}
}

.recharge_note {
	line-height: 1.8;
}

.dialog-footer-recharge {
	margin-top: 50px;
	margin-bottom: 20px;
}
</style>