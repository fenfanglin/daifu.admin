<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="通道ID/通道名称" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.type" placeholder="通道类型" clearable>
					<el-option v-for="item in channelType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="通道状态" clearable>
					<el-option v-for="item in modelStatus2" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="注册时间开始"
					end-placeholder="注册时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item> -->
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['channel:save:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" icon="el-icon-delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['channel:delete']">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['channel:export']">导出</el-button>
			</el-col>
		</el-row>

		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column label="通道ID" prop="id" :show-overflow-tooltip="true" fixed="left" width="120" />
			<el-table-column label="通道名称" prop="name" :show-overflow-tooltip="true" min-width="60" />
			<el-table-column label="通道代码" prop="code" min-width="60" />
			<el-table-column label="通道类型" min-width="40">
				<template slot-scope="scope">
					<span :class="scope.row.type_class">{{scope.row.type_str}}</span>
				</template>
			</el-table-column>
			<!-- <el-table-column label="通道费率" prop="rate" min-width="40" /> -->
			<el-table-column label="通道状态" min-width="40">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="更新时间" prop="update_time" min-width="100" />
			<el-table-column label="操作" width="300" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel:save:edit']" plain>编辑</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['channel:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['channel:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel:delete']" plain>删除</el-button> -->
				</template>
			</el-table-column>
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column label="通道ID" prop="id" :show-overflow-tooltip="true" width="120" />
			<el-table-column label="通道名称" prop="name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="通道代码" prop="code" width="150" />
			<el-table-column label="通道类型" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.type_class">{{scope.row.type_str}}</span>
				</template>
			</el-table-column>
			<!-- <el-table-column label="通道费率" prop="rate" width="120" /> -->
			<el-table-column label="通道状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="更新时间" prop="update_time" width="200" />
			<el-table-column label="操作" width="300">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel:save:edit']" plain>编辑</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['channel:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['channel:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel:delete']" plain>删除</el-button> -->
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

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="通道名称">
						<el-input v-model="form.name" maxlength="20" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<el-form-item label="通道代码">
						<el-input v-model="form.code" maxlength="50" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<!-- <el-form-item label="通道费率">
						<el-input-number v-model="form.rate" :controls="false" class="text-left" />
						<el-tooltip class="item ml20" effect="dark" content="例如：千分之三填 0.003" placement="right">
							<i class="el-icon-warning-outline"></i>
						</el-tooltip>
					</el-form-item> -->
					<el-form-item label="通道类型">
						<el-select v-model="form.type">
							<el-option v-for="item in channelType" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="通道状态">
						<el-radio-group v-model="form.status">
							<el-radio v-for="item in modelStatus2" :label="item.value">{{item.label}}</el-radio>
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
	name: "channel_list_all", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: this.getUser(),
			is_mobile: this.isMobile(),
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			// 弹出层标题
			title: "",
			// 是否显示弹出层
			open: false,
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				keyword: "",
				type: "",
				status: "",
				create_time: [],
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {
				name: [
					{ required: true, message: "代理名称不能为空", trigger: "blur" }
				],
				phone: [
					{
						required: true,
						pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
						message: "请输入正确的电话号码",
						trigger: "blur",
					}
				],
				email: [
					{
						type: "email",
						message: "请输入正确的邮箱地址",
						trigger: ["blur", "change"],
					}
				],
			},
		}
	},
	computed: {
		modelStatus2() {
			return this.$store.getters.modelStatus2
		},
		channelType() {
			return this.$store.getters.channelType
		},
	},
	created() {
		this.getList();
		
		// console.log("==============================================================")
		// var user = getUser()
		// console.log("user", user)
		
		// const obj = { name: 'ryan' }
		// Cookies.set('user', JSON.stringify(obj))
		// var user = JSON.parse(Cookies.get('user'))
		// console.log("user", user)
	},
	methods: {
		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "channel/list",
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
			this.reset();
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
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.no)
			this.single = selection.length != 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加";
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "channel/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.open = true;
				that.title = "编辑";
			});
		},
		/** 提交按钮 */
		submitForm: function() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "channel/save",
						data: that.form,
					}).then(res => {
						that.open = false;
						that.getList();
						
						if (that.form.id != undefined) {
							that.$modal.msgSuccess("编辑成功");
						} else {
							that.$modal.msgSuccess("新增成功");
						}
					});
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			let that = this;
			
			const ids = row.no || this.ids;
			
			that.$confirm("是否确认删除?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "channel/delete",
					data: {
						ids,
					},
				}).then(res => {
					that.$modal.msgSuccess("删除成功");
					that.getList();
				});
			}).catch(() => {
				
			})
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
					url: "channel/enable",
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
					url: "channel/disable",
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
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("channel/export", this.queryParams, "管理员").then(res => {
				
			});
		},
	}
};
</script>
