<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="商户id" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.content" placeholder="监控内容" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.device_imei" placeholder="设备id" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.amount" placeholder="金额" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.account_sub" placeholder="尾号" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker v-model="queryParams.create_time" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="监控时间开始" end-placeholder="监控时间结束" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in notifyStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.type" placeholder="类型" clearable>
					<el-option v-for="item in notifyType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['log:export']">导出</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" width="90" />
			<el-table-column label="商户id" prop="business_id" width="90" />
			<el-table-column label="金额" prop="amount" width="90" />
			<el-table-column label="尾号" prop="account_sub" width="90" />
			<el-table-column label="标题" prop="title" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="内容">
				<template slot-scope="scope">
					<span class="text-cursor text-overflow" @click="handleView(scope.row)">{{scope.row.content}}</span>
				</template>
			</el-table-column>
			<el-table-column label="监控时间" prop="create_time" width="200" />
			<el-table-column label="状态" width="100">
				<template slot-scope="scope">
					<el-tooltip v-if="scope.row.error" effect="dark" :content="scope.row.error" placement="top">
						<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
					</el-tooltip>
					<span v-else :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="设备id" :show-overflow-tooltip="true" width="190">
				<template slot-scope="scope">
					<span class="text-copy" v-clipboard:copy="scope.row.device_imei" v-clipboard:success="clipboardSuccess">{{scope.row.device_imei}}</span>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

		<el-dialog title="详细内容" :visible.sync="open" width="700px" append-to-body>
			<div class="wiki-preview-body markdown-body">
				<h5>标题：</h5>
				<div class="markdown-code-block">
					<pre><code>{{detail.title}}</code></pre>
				</div>
				<h5>内容：</h5>
				<div class="markdown-code-block">
					<pre><code>{{detail.content}}</code></pre>
				</div>
				<h5>处理记录：</h5>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code>{{detail.result}}</code></pre>
				</div>
				<h5>处理结果：</h5>
				<div v-if="detail.status == 1" class="markdown-code-block">
					<pre><code>状态：{{detail.status_str}}
金额：{{detail.amount}}
尾号：{{detail.account_sub}}</code></pre>
				</div>
				<div v-else class="markdown-code-block">
					<pre><code>状态：{{detail.status_str}}</code></pre>
				</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import variables from '@/assets/styles/markdown.css'
export default {
	name: "order_list_notify", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			detail: {},

			open: false,

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
		notifyType() {
			return this.$store.getters.notifyType
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
				url: "notify_log/list",
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
		cancel() {
			this.open = false;
			this.reset();
		},
		handleView(row) {
			let that = this

			that.reset()
			this.open = true

			that.detail = row
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;

			that.exportExcel("log/export", this.queryParams, "后台操作记录").then(res => {

			});
		},
		/** 复制代码成功 */
		clipboardSuccess() {
			this.$modal.msgSuccess("复制成功");
		},
	}
};
</script>
