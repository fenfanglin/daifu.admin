<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item label="关键词" label-width="56px" class="mr20">
				<el-input v-model="queryParams.keyword" placeholder="输入角色名称" clearable/>
			</el-form-item>
			<el-form-item label="状态" label-width="40px" class="mr20">
				<el-select v-model="queryParams.status" placeholder="请选择运行状态" clearable>
					<el-option v-for="item in modelStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="添加时间" label-width="70px" class="mr20">
				<el-date-picker
					v-model="queryParams.created_time"
					value-format="yyyy-MM-dd"
					type="daterange"
					range-separator="-"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
				/>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="success" plain icon="el-icon-plus" @click="handleAdd">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" plain icon="el-icon-delete" :disabled="multiple" @click="handleDelete">删除</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column align="center" type="selection" width="55" />
			<el-table-column align="center" label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" min-width="40" />
			<el-table-column align="center" label="角色名称" prop="name" :show-overflow-tooltip="true" />
			<el-table-column align="center" label="状态" min-width="80">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.status" active-value="1" inactive-value="-1" @change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column align="center" label="创建时间" prop="created_time" min-width="100" />
			<el-table-column align="center" label="操作" min-width="100" fixed="right">
				<template slot-scope="scope">
					<el-button type="text" class="" icon="el-icon-edit" @click="handleEdit(scope.row)">修改</el-button>
					<el-button type="text" class="text-danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
					
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

		<!-- 添加或修改对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="角色名称">
						<el-input v-model="form.name" maxlength="20" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<el-form-item label="状态">
						<el-radio-group v-model="form.status">
							<el-radio :label="1">启用</el-radio>
							<el-radio :label="-1">停用</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="权限">
						<div v-for="(item, key) in form.permission" class="checkbox_lv1">
							<el-checkbox v-model="item.check" :checked="item.check">{{item.title}}</el-checkbox>
							<div v-for="(item2, key2) in item.children" class="checkbox_lv2">
								<el-checkbox v-model="item2.check" :checked="item2.check">{{item2.title}}</el-checkbox>
							</div>
						</div>
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
import { getUser } from '@/utils/auth';

export default {
	name: "admin_role",
	data() {
		return {
			user: getUser(),
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
				status: "",
				create_time: [],
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {
				name: [
					{ required: true, message: "角色名称不能为空", trigger: "blur" }
				],
			},
			
			permission: [],
		}
	},
	computed: {
		modelStatus() {
			return this.$store.getters.modelStatus
		},
	},
	created() {
		this.getList();
		this.getCenterPermission();
	},
	methods: {
		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			this.loading = true;
			roleList(this.queryParams).then(res => {
				this.list = res.data.list;
				this.total = res.data.total;
				this.loading = false;
			});
		},
		/** 查询列表 */
		getCenterPermission() {
			roleGetCenterFullPermission({
				center_id: this.user.center_id
			}).then(res => {
				this.permission = res.data.permission;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
		},
		// 表单重置
		reset() {
			this.form = {
				name: undefined,
				status: undefined,
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
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.id)
			this.single = selection.length != 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加";
			
			this.form.permission = this.permission;
			
		},
		/** 修改按钮操作 */
		handleEdit(row) {
			this.reset();
			const id = row.id || this.ids
			roleView({
				id
			}).then(res => {
				this.form = res.data;
				this.open = true;
				this.title = "修改";
			});
		},
		/** 提交按钮 */
		submitForm: function() {
			this.$refs["form"].validate(valid => {
				if (valid) {
					roleSave(this.form).then(res => {
						this.open = false;
						this.getList();
						
						if (this.form.id != undefined) {
							this.$modal.msgSuccess("修改成功");
						} else {
							this.$modal.msgSuccess("新增成功");
						}
					});
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			const ids = row.id || this.ids;
			let that = this;
			this.$confirm("是否确认删除?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				roleDelete({
					ids,
				}).then(res => {
					that.$modal.msgSuccess("删除成功");
					that.getList();
				});
			}).catch(() => {
				
			})
		},
		/** 状态修改按钮 */
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
		/** 启用 */
		enable(row) {
			let that = this;
			this.$confirm("是否确认启用此角色?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				roleEnable({
					id: row.id,
				}).then(res => {
					that.$modal.msgSuccess("启用成功");
					that.getList();
				});
			}).catch(() => {
				row.status = "-1";
			})
		},
		/** 禁用 */
		disable(row) {
			let that = this;
			this.$confirm("是否确认禁用此角色?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				roleDisable({
					id: row.id,
				}).then(res => {
					that.$modal.msgSuccess("禁用成功");
					that.getList();
				});
			}).catch(() => {
				row.status = "1";
			})
		},
		/** 导出按钮操作 */
		handleExport() {
			roleExport(this.queryParams, "角色").then(res => {
				
			});
		},
	}
};
</script>