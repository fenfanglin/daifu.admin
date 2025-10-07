<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.username" placeholder="后台管理员账号" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.ip" placeholder="ip" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.url" placeholder="链接" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="参数" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="操作时间开始"
					end-placeholder="操作时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
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
			<el-table-column label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" width="100" />
			<el-table-column label="后台管理员" prop="admin_username" :show-overflow-tooltip="true" min-width="20" />
			<el-table-column label="ip" prop="ip" :show-overflow-tooltip="true" min-width="22" />
			<el-table-column label="链接" prop="url" :show-overflow-tooltip="true" min-width="30" />
			<el-table-column label="参数">
				<template slot-scope="scope">
					<span class="text-cursor text-overflow" @click="handleView(scope.row)">{{scope.row.params}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作时间" prop="create_time" min-width="25" />
		</el-table>
		
		<pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/>
		
		<el-dialog title="详细内容" :visible.sync="open" width="700px" append-to-body>
			<div class="wiki-preview-body markdown-body">
				<h4>请求信息：</h4>
				<div class="markdown-code-block">
					<pre><code>操作时间：{{detail.create_time}}
后台管理员：{{detail.admin_username}}
ip：{{detail.ip}}
链接：{{detail.url}}</code></pre>
				</div>
				<h4>请求参数：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;">{{detail.params_code}}</pre>
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
	name: "system_log", // 路由上 '/' 换成 '_'
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
		
	},
	async created() {
		this.getList();
		// this.getUserInfo();
		this.user = await this.userInfo()
		console.log('this.user', this.user.name)
	},
	methods: {
		async getUserInfo() {
			let that = this
			
			let userInfo = await that.userInfo()
			console.log('userInfo', userInfo)
			
		},
		
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "log/list",
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
	}
};
</script>
