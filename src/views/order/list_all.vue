<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="代理id" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.order_no" placeholder="系统订单号" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.out_trade_no" placeholder="商户订单号" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.account_type" placeholder="收款方式" clearable>
					<el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker v-model="queryParams.success_time" type="datetimerange" range-separator="至" start-placeholder="成功时间开始" end-placeholder="成功时间结束" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="下单时间开始"
					end-placeholder="下单时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item> -->
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in orderStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['order:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
				<!-- <el-button icon="el-icon-refresh" size="medium" @click="openNotify = true">TEST</el-button> -->
			</el-form-item>
		</el-form>

		<el-row class="mt10 mb20">
			<el-col :span="1.5" class="total-info">
				今日交易总额：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">￥{{info.today_amount}}</el-tag>
				今日交易笔数：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{info.today_order}}单</el-tag>
				今日成功率：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{info.today_success_rate}}%</el-tag>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="订单号" width="280" :show-overflow-tooltip="true" :fixed="is_mobile ? null : 'left'">
				<template slot-scope="scope">
					<span>系统单号：{{scope.row.order_no}}</span><br>
					<span>商户单号：{{scope.row.out_trade_no}}</span>
				</template>
			</el-table-column>
			<el-table-column label="代理" :show-overflow-tooltip="true" width="120" class="text-center">
				<template slot-scope="scope">
					<span>{{ scope.row.business_id}}</span>
					<span>【{{scope.row.business_realname}}】</span>
				</template>
			</el-table-column>
			<el-table-column label="其他信息" :show-overflow-tooltip="true" width="180">
				<template slot-scope="scope">
					<span>商户：{{ scope.row.sub_business_id}}【{{scope.row.sub_business_realname}}】</span><br>
					<span v-if="scope.row.card_business_id > 0">工作室：{{ scope.row.card_business_id }}【{{scope.row.card_business_realname}}】</span>
					<span v-else>工作室：未分配</span>
				</template>
			</el-table-column>
			<el-table-column label="时间" width="260" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>下单时间：{{scope.row.create_time}}</span><br>
					<span>成功时间：{{scope.row.success_time}}</span>
				</template>
			</el-table-column>
			<el-table-column v-if="is_mobile == false" label="收款信息" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span v-if="scope.row.account_type === 1">
						<span>银行：{{ scope.row.bank }} </span>
						<span>支行：{{ scope.row.branch }}</span><br>
						<span>姓名：{{ scope.row.account_name }} </span>
						<span>卡号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 2">
						<span>usdt账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 3">
						<span>支付宝姓名：{{ scope.row.account_name }}</span> <br>
						<span>支付宝账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 4">
						<span>数字RMB姓名：{{ scope.row.account_name }}</span> <br>
						<span>钱包编号：{{ scope.row.account }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column v-else label="收款信息" :show-overflow-tooltip="true" width="300">
				<template slot-scope="scope">
					<span v-if="scope.row.account_type === 1">
						<span>银行：{{ scope.row.bank }} </span>
						<span>支行：{{ scope.row.branch }} </span><br>
						<span>姓名：{{ scope.row.account_name }} </span>
						<span>卡号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 2">
						<span>usdt账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 3">
						<span>支付宝姓名：{{ scope.row.account_name }}</span> <br>
						<span>支付宝账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 4">
						<span>数字RMB姓名：{{ scope.row.account_name }}</span> <br>
						<span>钱包编号：{{ scope.row.account }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="订单备注" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span>{{ scope.row.remark }}</span><br>
				</template>
			</el-table-column>
			<el-table-column label="交易金额" width="120">
				<template slot-scope="scope">
					<span class="text-danger">{{scope.row.amount}}</span><br>
					<span v-if="scope.row.usdt_amount > 0" class="text-success">U: {{scope.row.usdt_amount}}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" width="140">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="120" :fixed="is_mobile ? null : 'right'">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-search" @click="handleView(scope.row)" plain>查看</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-success" @click="handleSetSuccess(scope.row)" v-hasPermi="['order:set_order_success']" plain>设为成功</el-button>
					<el-button type="warning" class="tb-button" icon="el-icon-chat-line-square" @click="handleSetRemark(scope.row)" v-hasPermi="['order:set_remark']" plain>备注</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" label-width="100px">
				<el-row>
					<el-form-item label="商户单号">
						<el-input v-model="form.out_trade_no" :readonly="true" />
					</el-form-item>
					<el-form-item label="交易金额">
						<el-input v-model="form.pay_amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="Usdt金额" v-if="form.usdt_amount > 0">
						<el-input v-model="form.usdt_amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="form.remark" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button v-if="formType == 'set_success'" type="danger" v-hasPermi="['order:set_order_success']" @click="submitFormSuccess">设为成功</el-button>
				<el-button v-else-if="formType == 'set_remark'" type="warning" v-hasPermi="['order:set_remark']" @click="submitFormRemark">备注</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog title="订单信息" :visible.sync="openDetail" width="700px" append-to-body :close-on-click-modal="false">
			<el-table ref="multipleTable2" border empty-text="没有相关数据" :data="detail.info">
				<el-table-column label="内容" prop="title" :show-overflow-tooltip="true" min-width="30" />
				<el-table-column label="信息" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span v-if="scope.row.check == 'usdt_trade'" class="pointer text-primary" @click="goUsdtTrade(scope.row.value)">{{ scope.row.value }}</span>
						<span v-else-if="scope.row.check == 'image'">
							<el-card shadow="hover" :body-style="{ padding: '10px' }">
								<el-popover>
									<img :src="scope.row.value" slot="reference" class="image" />
									<img :src="scope.row.value" class="imagePreview" />
								</el-popover>
							</el-card>
						</span>
						<span v-else :class="scope.row.class">{{ scope.row.value }}</span>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
				<el-button v-if="detail.status == 1" type="danger" @click="resendNotify(detail.no)">补发通知</el-button>
			</div>
		</el-dialog>

		<el-dialog title="补发通知" :visible.sync="openNotify" width="700px" append-to-body :close-on-click-modal="false">
			<div class="wiki-preview-body markdown-body">
				<h4>回调连接：</h4>
				<div class="markdown-code-block">
					<pre><code>{{notify_result.url}}</code></pre>
				</div>
				<h4>请求状态：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code><span v-if="notify_result.url">请求时间：{{notify_result.time}}s
HTTP状态：{{notify_result.http_code}}
HTTP错误：{{notify_result.http_error}}
CURL错误：{{notify_result.curl_errno}}</span></code></pre>
				</div>
				<h4>请求参数：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code>{{notify_result.params}}</code></pre>
				</div>
				<h4>返回信息：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code>{{notify_result.response}}</code></pre>
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
	name: "order_list_all", // 路由上 '/' 换成 '_'
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
			openDetail: false,
			openNotify: false,

			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				out_trade_no: "",
				card_business_id: "",
				status: "",
				create_time: [],
				success_time: [],
			},
			// 表单参数
			title: "",
			form: {},
			formType: "",
			detail: {},
			notify_result: "",
		}
	},
	computed: {
		orderStatus() {
			return this.$store.getters.orderStatus
		},
		accountType() {
			return this.$store.getters.accountType
		}
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this

			that.loading = true;
			that.request({
				url: "order/list",
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
			this.openDetail = false;
			this.openNotify = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {}
			this.notify_result = {}

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
		handleView(row) {
			let that = this

			that.reset();
			that.request({
				url: "order/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.detail = res.data;
				that.openDetail = true;
			});
		},
		handleSetSuccess(row) {
			let that = this

			that.reset();

			that.form = row;
			that.formType = "set_success";
			that.open = true;
			that.title = "设为成功";
		},
		handleSetRemark(row) {
			let that = this

			that.reset();

			that.form = row;
			that.formType = "set_remark";
			that.open = true;
			that.title = "备注";
		},
		submitFormSuccess() {
			let that = this

			that.request({
				url: "order/set_order_success",
				data: {
					no: that.form.no,
					remark: that.form.remark,
				},
			}).then(res => {
				that.cancel();
				that.getList();

				that.$modal.msgSuccess("成功");
			});
		},
		submitFormRemark() {
			let that = this

			that.request({
				url: "order/set_remark",
				data: {
					no: that.form.no,
					remark: that.form.remark,
				},
			}).then(res => {
				that.cancel();
				that.getList();

				that.$modal.msgSuccess("成功");
			});
		},
		resendNotify(no) {
			let that = this

			that.cancel();
			that.loading = true;

			that.request({
				url: "order/resend_notify",
				data: {
					no: no,
				},
			}).then(res => {
				that.loading = false;
				that.notify_result = res.data

				setTimeout(function () {
					that.openNotify = true;
				}, 300);

				that.getList();
			});
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;

			that.exportExcel("order/export", this.queryParams, "订单").then(res => {

			});
		},
		goIp(ip) {
			let href = `https://ip.cn/ip/${ip}.html`
			window.open(href, '_blank')
		},
		goUsdtTrade(trade) {
			let href = `https://tronscan.org/#/transaction/${trade}`
			window.open(href, '_blank')
		},
	}
};
</script>
<style lang="scss">
.el-switch__label * {
	line-height: 1;
	font-size: 17px;
	display: inline-block;
}
.image {
	width: 110px;
	height: 110px;
	cursor: zoom-in;
}
.imagePreview {
	max-height: 800px;
}
.el-switch__label.is-active {
	color: #ff4949;
}
</style>
