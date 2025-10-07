<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="商户id" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.type" placeholder="类型" clearable>
					<el-option v-for="item in moneyLogType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.money" placeholder="发生金额" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="备注" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="时间开始"
					end-placeholder="时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['money_log:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		
		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" fixed="left" min-width="10%" />
			<el-table-column label="商户id" prop="business_id" min-width="13%" />
			<el-table-column label="类型" prop="type_str" min-width="17%" />
			<el-table-column label="发生金额" min-width="15%">
				<template slot-scope="scope">
					<span v-if="scope.row.money >= 0" class="text-success">{{scope.row.money}}</span>
					<span v-else class="text-danger">{{scope.row.money}}</span>
				</template>
			</el-table-column>
			<el-table-column label="发生前金额" prop="money_before" min-width="15%" />
			<el-table-column label="发生后金额" prop="money_after" min-width="15%" />
			<el-table-column label="时间" prop="create_time" min-width="30%" />
			<el-table-column label="备注" prop="remark" width="400" />
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" width="100" />
			<el-table-column label="商户id" prop="business_id" width="120" />
			<el-table-column label="类型" prop="type_str" width="120" />
			<el-table-column label="发生金额" width="120">
				<template slot-scope="scope">
					<span v-if="scope.row.money >= 0" class="text-success">{{scope.row.money}}</span>
					<span v-else class="text-danger">{{scope.row.money}}</span>
				</template>
			</el-table-column>
			<el-table-column label="发生前金额" prop="money_before" width="120" />
			<el-table-column label="发生后金额" prop="money_after" width="120" />
			<el-table-column label="时间" prop="create_time" width="200" />
			<el-table-column label="备注" prop="remark" width="300" />
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
	name: "order_list_notify", // 路由上 '/' 换成 '_'
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
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				username: "",
				keyword: "",
				url: "",
				ip: "",
				create_time: [],
			},
			
		}
	},
	computed: {
		notifyStatus() {
			return this.$store.getters.notifyStatus
		},
		moneyLogType() {
			return this.$store.getters.moneyLogType
		},
	},
	async created() {
		this.getList();
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "money_log/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.loading = false;
			});
		},
		// 表单重置
		reset() {
			this.form = {
				name: undefined,
				phone: undefined,
				status: undefined,
				center_id: undefined,
				role_id: undefined,
			};
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
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("money_log/export", this.queryParams, "资金明细").then(res => {
				
			});
		},
	}
};
</script>
