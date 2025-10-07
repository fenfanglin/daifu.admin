<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="商户id" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.channel_id" placeholder="通道" clearable>
					<el-option v-for="item in optionChannel" :key="item.id" :label="item.name" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.success_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="成功时间开始"
					end-placeholder="成功时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in orderStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
			</el-form-item>
		</el-form>
		
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['demo_account:save:add']">添加账号</el-button>
			</el-col>
		</el-row>

		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column label="商户id" prop="business_id" :show-overflow-tooltip="true" width="100" />
			<el-table-column label="通道" prop="channel_name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="银行卡名称" prop="system_bank_name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="账号姓名" prop="account_name" :show-overflow-tooltip="true" width="180" />
			<el-table-column label="银行卡号/钱包账号" prop="account" />
			<el-table-column label="状态" width="150">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="250" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['demo_account:save:edit']" plain>编辑</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['demo_account:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['demo_account:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['demo_account:delete']" plain>删除</el-button> -->
				</template>
			</el-table-column>
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column label="商户id" prop="business_id" :show-overflow-tooltip="true" width="100" />
			<el-table-column label="通道" prop="channel_name" :show-overflow-tooltip="true" width="100" />
			<el-table-column label="银行卡名称" prop="system_bank_name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="账号姓名" prop="account_name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="银行卡号/钱包账号" prop="account" width="220" />
			<el-table-column label="状态" width="100">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="250">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['demo_account:save:edit']" plain>编辑</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['demo_account:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['demo_account:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['demo_account:delete']" plain>删除</el-button> -->
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

		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" label-width="100px">
				<el-row>
					<el-form-item label="商户ID">
						<el-input-number v-model="form.business_id" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="通道">
						<el-select v-model="form.channel_id">
							<el-option v-for="item in optionChannel" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<div v-if="form.channel_id == 101 || form.channel_id == 107">
						<el-form-item label="银行">
							<el-select v-model="form.system_bank_id">
								<el-option v-for="item in optionSystemBank" :key="item.id" :label="item.name" :value="item.id" />
							</el-select>
						</el-form-item>
						<el-form-item label="账户姓名">
							<el-input v-model="form.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="银行卡号">
							<el-input v-model="form.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<div v-else-if="form.channel_id == 104 || form.channel_id == 105 || form.channel_id == 106">
						<el-form-item label="支付宝姓名">
							<el-input v-model="form.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="支付宝账号">
							<el-input v-model="form.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<div v-else>
						<el-form-item label="账户姓名">
							<el-input v-model="form.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="钱包编号">
							<el-input v-model="form.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<el-form-item label="状态">
						<el-radio-group v-model="form.status">
							<el-radio label="1">开启</el-radio>
							<el-radio label="-1">关闭</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "admin_demo_account", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: this.getUser(),
			is_mobile: this.isMobile(),
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			info: [],
			// 是否显示弹出层
			open: false,
			
			optionChannel: [],
			optionSystemBank: [],
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				out_trade_no: "",
				card_business_id: "",
				channel_id: "",
				status: "",
				create_time: [],
				success_time: [],
			},
			// 表单参数
			title: "",
			form: {},
			formSimple: {},
			detail: {},
		}
	},
	computed: {
		orderStatus() {
			return this.$store.getters.orderStatus
		},
	},
	created() {
		this.getList();
		this.getOptionChannel();
		this.getOptionSystemBank();
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "demo_account/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.info = res.data.info;
				that.loading = false;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			// this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				business_id: this.cookies.get('demo_account_business_id') ?? 10301,
				channel_id: this.cookies.get('demo_account_channel_id') ? parseInt(this.cookies.get('demo_account_channel_id')) : 101,
				status: '1',
			}
			
			this.resetForm("form");
			this.resetForm("notify_result");
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
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "demo_account/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = row;
				that.open = true;
			});
		},
		submitForm() {
			let that = this
			
			that.request({
				url: "demo_account/save",
				data: that.form,
			}).then(res => {
				that.cancel();
				that.getList();
				
				that.cookies.set('demo_account_business_id', that.form.business_id)
				that.cookies.set('demo_account_channel_id', that.form.channel_id)
				
				that.$modal.msgSuccess("成功");
			});
		},
		/** 状态编辑按钮 */
		handleStatusChange(row) {
			switch (row.status) {
				case "1":
					this.enable(row);
					break;
				case "-1":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 更多操作触发 */
		handleCommand(command, row) {
			switch (command) {
				case "enable":
					this.enable(row);
					break;
				case "disable":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 开启 */
		enable(row) {
			let that = this;
			
			that.$confirm("是否确认开启此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "demo_account/enable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("开启成功");
					that.getList();
				}).catch(() => {
					row.status = "-1";
				})
			}).catch(() => {
				row.status = "-1";
			})
		},
		/** 关闭 */
		disable(row) {
			let that = this;
			
			that.$confirm("是否确认关闭此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "demo_account/disable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("关闭成功");
					that.getList();
				}).catch(() => {
					row.status = "1";
				})
			}).catch(() => {
				row.status = "1";
			})
		},
		// /** 导出按钮操作 */
		// handleExport() {
		// 	let that = this;
			
		// 	that.exportExcel("demo_account/export", this.queryParams, "订单").then(res => {
				
		// 	});
		// },
		getOptionChannel() {
			let that = this;
			
			that.request({
				url: "option/channel",
				data: {},
			}).then(res => {
				that.optionChannel = res.data
			});
		},
		getOptionSystemBank() {
			let that = this;
			
			that.request({
				url: "option/system_bank",
				data: {},
			}).then(res => {
				that.optionSystemBank = res.data
			});
		},
	}
};
</script>
<style lang="scss">
	
</style>