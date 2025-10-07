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
				<el-button type="primary" icon="el-icon-plus" @click="handleAddDetail" v-hasPermi="['demo_order:save_detail']">手动添加</el-button>
				<el-button type="primary" icon="el-icon-plus" @click="handleAddSimple" v-hasPermi="['demo_order:save_simple']">快速添加</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="订单号" width="280" :show-overflow-tooltip="true" :fixed="is_mobile ? null : 'left'">
				<template slot-scope="scope">
					<span>系统单号：{{scope.row.order_no}}</span><br>
					<span>商户单号：{{scope.row.out_trade_no}}</span>
				</template>
			</el-table-column>
			<el-table-column label="商户" prop="business_id" width="90" />
			<el-table-column label="时间" width="260" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>下单时间：{{scope.row.create_time}}</span><br>
					<span>成功时间：{{scope.row.success_time}}</span>
				</template>
			</el-table-column>
			<el-table-column v-if="is_mobile == false" label="支付方式" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>{{scope.row.account_title}}：{{scope.row.account_name}}</span><br>
					<span class="mr20">尾号：{{scope.row.account_sub}}</span>
					<span>备注：<span class="text-danger bolder">{{scope.row.remark}}</span></span>
				</template>
			</el-table-column>
			<el-table-column v-else label="支付方式" :show-overflow-tooltip="true" width="300">
				<template slot-scope="scope">
					<span>{{scope.row.account_title}}：{{scope.row.account_name}}</span><br>
					<span class="mr20">尾号：{{scope.row.account_sub}}</span>
					<span>备注：<span class="text-danger bolder">{{scope.row.remark}}</span></span>
				</template>
			</el-table-column>
			<!-- <el-table-column label="付款人姓名" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span>提交：{{scope.row.payer_name}}</span><br>
					<span v-if="scope.row.sms_payer_name">短信：{{scope.row.sms_payer_name}}</span>
				</template>
			</el-table-column> -->
			<el-table-column label="通道" width="150">
				<template slot-scope="scope">
					<span>{{scope.row.channel_name}}</span>
				</template>
			</el-table-column>
			<el-table-column label="其他" :show-overflow-tooltip="true" width="180">
				<template slot-scope="scope">
					<span>IP：<span class="pointer text-primary" @click="goIp(scope.row.pay_ip)">{{scope.row.pay_ip}}</span></span><br>
					<span v-if="scope.row.notify_log_id > 0">短信：{{scope.row.notify_log_id}}</span>
				</template>
			</el-table-column>
			<el-table-column label="交易金额" width="120">
				<template slot-scope="scope">
					<span class="text-danger">{{scope.row.pay_amount}}</span><br>
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
					<el-button type="danger" class="tb-button" icon="el-icon-success" @click="handleSetSuccess(scope.row)" v-hasPermi="['demo_order:set_order_success']" plain>设为成功</el-button>
					<el-button type="warning" class="tb-button" icon="el-icon-chat-line-square" @click="handleSetRemark(scope.row)" v-hasPermi="['demo_order:set_remark']" plain>备注</el-button>
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

		<el-dialog :title="title" :visible.sync="openDetail" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="formDetail" label-width="100px">
				<el-row>
					<el-form-item label="商户ID">
						<el-input-number v-model="formDetail.business_id" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="通道">
						<el-select v-model="formDetail.channel_id">
							<el-option v-for="item in optionChannel" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<div v-if="formDetail.channel_id == 101 || formDetail.channel_id == 107">
						<el-form-item label="银行">
							<el-input v-model="formDetail.account_title" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="账户姓名">
							<el-input v-model="formDetail.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="银行卡号">
							<el-input v-model="formDetail.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<div v-else-if="formDetail.channel_id == 104 || formDetail.channel_id == 105 || formDetail.channel_id == 106">
						<el-form-item label="支付宝姓名">
							<el-input v-model="formDetail.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="支付宝账号">
							<el-input v-model="formDetail.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<div v-else>
						<el-form-item label="账户姓名">
							<el-input v-model="formDetail.account_name" maxlength="20" show-word-limit autocomplete="off" />
						</el-form-item>
						<el-form-item label="钱包编号">
							<el-input v-model="formDetail.account" maxlength="50" show-word-limit autocomplete="off" />
						</el-form-item>
					</div>
					<el-form-item label="金额">
						<el-input-number v-model="formDetail.pay_amount" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="下单时间">
						<el-radio-group v-model="formDetail.create_time_type">
							<el-radio label="2">2分钟前</el-radio>
							<el-radio label="3">3分钟前</el-radio>
							<el-radio label="5">5分钟前</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="状态">
						<el-radio-group v-model="formDetail.status">
							<el-radio label="-1">未支付</el-radio>
							<el-radio label="2">成功，已回调</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" v-hasPermi="['demo_order:save_detail']" @click="submitFormAddDetail">生成订单</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog :title="title" :visible.sync="openSimple" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="formSimple" label-width="100px">
				<el-row>
					<el-form-item label="商户ID">
						<el-input-number v-model="formDetail.business_id" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="通道">
						<el-select v-model="formSimple.channel_id">
							<el-option v-for="item in optionChannel" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="金额">
						<el-input-number v-model="formSimple.pay_amount" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="下单时间">
						<el-radio-group v-model="formSimple.create_time_type">
							<el-radio label="2">2分钟前</el-radio>
							<el-radio label="3">3分钟前</el-radio>
							<el-radio label="5">5分钟前</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="状态">
						<el-radio-group v-model="formSimple.status">
							<el-radio label="-1">未支付</el-radio>
							<el-radio label="2">成功，已回调</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" v-hasPermi="['demo_order:save_simple']" @click="submitFormAddSimple">生成订单</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog title="订单信息" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
			<el-table ref="multipleTable2" border empty-text="没有相关数据" :data="detail.info">
				<el-table-column label="内容" prop="title" :show-overflow-tooltip="true" min-width="30" />
				<el-table-column label="信息" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span v-if="scope.row.check == 'usdt_trade'" class="pointer text-primary" @click="goUsdtTrade(scope.row.value)">{{scope.row.value}}</span>
						<span v-else :class="scope.row.class">{{scope.row.value}}</span>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
				<el-button v-if="detail.status == 1" type="danger" @click="resendNotify(detail.no)">补发通知</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "admin_demo_order", // 路由上 '/' 换成 '_'
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
			openSimple: false,
			
			optionChannel: [],
			
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
			formDetail: {},
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
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "demo_order/list",
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
			this.openSimple = false;
			// this.reset();
		},
		// 表单重置
		reset() {
			this.formDetail = this.formSimple = {
				business_id: this.cookies.get('demo_order_business_id') ?? 10301,
				channel_id: this.cookies.get('demo_order_channel_id') ? parseInt(this.cookies.get('demo_order_channel_id')) : 101,
				create_time_type: '2',
				status: '2',
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
		handleView(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "demo_order/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.detail = res.data;
				that.open = true;
			});
		},
		handleAddDetail(row) {
			let that = this
			
			that.reset();
			
			that.form = row;
			that.openDetail = true;
		},
		handleAddSimple(row) {
			let that = this
			
			that.reset();
			
			that.form = row;
			that.openSimple = true;
		},
		submitFormAddDetail() {
			let that = this
			
			that.request({
				url: "demo_order/save_detail",
				data: that.formDetail,
			}).then(res => {
				that.cancel();
				that.getList();
				
				that.$modal.msgSuccess("成功");
			});
		},
		submitFormAddSimple() {
			let that = this
			
			that.request({
				url: "demo_order/save_simple",
				data: that.formSimple,
			}).then(res => {
				that.cancel();
				that.getList();
				
				that.cookies.set('demo_order_business_id', that.formSimple.business_id)
				that.cookies.set('demo_order_channel_id', that.formSimple.channel_id)
				
				that.$modal.msgSuccess("成功");
			});
		},
		// /** 导出按钮操作 */
		// handleExport() {
		// 	let that = this;
			
		// 	that.exportExcel("demo_order/export", this.queryParams, "订单").then(res => {
				
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
	
</style>