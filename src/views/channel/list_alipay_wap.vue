<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="支付宝名称/支付宝账号" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in modelStatus2" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="更新时间开始"
					end-placeholder="更新时间结束"
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
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['channel_alipay_wap:save:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" icon="el-icon-delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['channel_alipay_wap:delete']">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['channel_alipay_wap:export']">导出</el-button>
			</el-col>
		</el-row>

		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<!-- <el-table-column label="ID" prop="id" :show-overflow-tooltip="true" :fixed="is_mobile ? null : 'left'" width="100" /> -->
			<el-table-column label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" width="100" />
			<el-table-column label="商户名称" prop="business_username" :show-overflow-tooltip="true" width="120" />
			<el-table-column label="账号名称" prop="name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="APPID" prop="account" />
			<el-table-column label="单笔控制" width="180">
				<template slot-scope="scope">
					<span>{{scope.row.min_amount}} - {{scope.row.max_amount}}</span>
				</template>
			</el-table-column>
			<!-- <el-table-column label="钱包余额" prop="balance" width="120" /> -->
			<el-table-column label="启用状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="350" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel_alipay_wap:save:edit']" plain>编辑</el-button>
					<el-button type="primary" class="tb-button" icon="el-icon-setting" @click="handleEditInfo(scope.row)" v-hasPermi="['channel_alipay_wap:save_info:edit']" plain>设置</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['channel_alipay_wap:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['channel_alipay_wap:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel_alipay_wap:delete']" plain>删除</el-button> -->
				</template>
			</el-table-column>
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column label="ID" prop="id" :show-overflow-tooltip="true" width="100" />
			<el-table-column label="商户名称" prop="business_username" :show-overflow-tooltip="true" width="120" />
			<el-table-column label="账号名称" prop="name" :show-overflow-tooltip="true" width="150" />
			<el-table-column label="APPID" prop="account" width="220" />
			<el-table-column label="单笔控制" width="180">
				<template slot-scope="scope">
					<span>{{scope.row.min_amount}} - {{scope.row.max_amount}}</span>
				</template>
			</el-table-column>
			<el-table-column label="启用状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="350">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel_alipay_wap:save:edit']" plain>编辑</el-button>
					<el-button type="primary" class="tb-button" icon="el-icon-setting" @click="handleEditInfo(scope.row)" v-hasPermi="['channel_alipay_wap:save_info:edit']" plain>设置</el-button>
					<el-button type="success" class="tb-button" icon="el-icon-success
" @click="enable(scope.row)" v-hasPermi="['channel_alipay_wap:enable']" plain>开启</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-error" @click="disable(scope.row)" v-hasPermi="['channel_alipay_wap:disable']" plain>关闭</el-button>
					<!-- <el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel_alipay_wap:delete']" plain>删除</el-button> -->
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
					<el-form-item label="商户">
						<el-select v-model="form.business_id">
							<el-option v-for="item in optionBusiness" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="账号名称">
						<el-input v-model="form.name" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
					<el-form-item label="收款码">
						<el-input v-model="form.account" autocomplete="off" />
					</el-form-item>
					<el-form-item label="收款码">
						<el-upload
							action=""
							:show-file-list="false"
							:http-request="resolveQR"
						>
							<el-button
							type="success"
							>上传</el-button>
						</el-upload>
					</el-form-item>
					<el-form-item label="单笔控制">
						<el-input-number v-model="form.min_amount" :controls="false" class="text-left" />
						<el-input-number v-model="form.max_amount" :controls="false" class="text-left ml20" />
					</el-form-item>
					<el-form-item label="状态">
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
		
		<el-dialog title="设置" :visible.sync="open_info" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form_info" :model="form_info" :rules="rules_info" label-width="100px">
				<el-row>
					<el-form-item label="APPID">
						{{form_info.account}}
					</el-form-item>
					<el-form-item label="应用私钥">
						<el-input type="textarea" v-model="form_info.private_key" :rows="5" resize="none" />
					</el-form-item>
					<el-form-item label="支付宝公钥">
						<el-input type="textarea" v-model="form_info.public_key" :rows="5" resize="none" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitFormInfo">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog title="检测" :visible.sync="open_api" width="700px" append-to-body>
			<div class="wiki-preview-body markdown-body">
				<h5>支付宝账号：
					<el-tag v-if="form_api.is_online == 1" type="success">在线</el-tag>
					<el-tag v-else type="danger">离线</el-tag>
				</h5>
				<div class="markdown-code-block">
					<pre><code>{{form_api.account}}（{{form_api.name}}）</code></pre>
				</div>
				<h5>请求失败：
					<span v-if="form_api.is_online != 1" class="lighter text-danger">{{form_api.error_time}}</span>
					<span v-else class="lighter">{{form_api.error_time}}</span>
				</h5>
				<div class="markdown-code-block">
					<pre style="height: 111px;"><code>{{form_api.error}}</code></pre>
				</div>
				<h5>请求成功：
					<span v-if="form_api.is_online == 1" class="lighter text-success">{{form_api.success_time}}</span>
					<span v-else class="lighter">{{form_api.success_time}}</span>
				</h5>
				<div class="markdown-code-block">
					<pre style="height: 350px;"><code>{{form_api.detail}}</code></pre>
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
	name: "channel_list_alipay_wap", // 路由上 '/' 换成 '_'
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
			open_info: false,
			open_api: false,
			
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
			form_info: {
				info: {},
			},
			form_api: {
				
			},
			
			optionBusiness: [],
			
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
			
			rules_info: {
				code: [
					{ required: true, message: "监听密钥不能为空", trigger: "blur" }
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
		this.getOptionBusiness();
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
				url: "channel_alipay_wap/list",
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
			this.open_info = false;
			this.open_api = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				business_id: undefined,
				name: undefined,
				account: undefined,
				min_amount: undefined,
				max_amount: undefined,
				status: undefined,
			};
			this.form_info = {
				info: {
					referer: undefined,
					user_agent: undefined,
					cookie: undefined,
				},
			};
			this.resetForm("form");
			this.resetForm("form_info");
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
				url: "channel_alipay_wap/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.open = true;
				that.title = "编辑";
			});
		},
		handleEditInfo(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "channel_alipay_wap/view_info",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form_info = res.data;
				// console.log(res.data)
				that.open_info = true;
			});
		},
		handleViewApi(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "channel_alipay_xiaohebao/view_api",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form_api = res.data;
				that.open_api = true;
			});
		},
		/** 提交按钮 */
		submitForm: function() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "channel_alipay_wap/save",
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
		submitFormInfo: function() {
			let that = this
			
			that.$refs["form_info"].validate(valid => {
				if (valid) {
					that.request({
						url: "channel_alipay_wap/save_info",
						data: that.form_info,
					}).then(res => {
						that.open_info = false;
						that.getList();
						that.$modal.msgSuccess("设置成功");
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
					url: "channel_alipay_wap/delete",
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
					url: "channel_alipay_wap/enable",
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
					url: "channel_alipay_wap/disable",
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
			
			that.exportExcel("channel_alipay_wap/export", this.queryParams, "管理员").then(res => {
				
			});
		},
		getOptionBusiness() {
			let that = this;
			
			that.request({
				url: "option/business",
				data: {},
			}).then(res => {
				that.optionBusiness = res.data
			});
		},
		resolveQR(event) {
			let that = this;
			
			const result = that.qrDecode(event.file)
			result.then(res => {
				if (res.data) {
					console.log(res.data);
					that.form.account = res.data
					console.log('that.form', that.form);
					that.$message.success("识别二维码成功!")
				} else {
					console.log(res);
					that.$message.error("识别二维码失败, 请重新上传")
				}
			})
			.catch(err => {
				that.$message.error(JSON.stringify(err));
			});
		}
	}
};
</script>
