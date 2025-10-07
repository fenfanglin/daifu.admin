<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.business_id" placeholder="商户id" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.account_type" placeholder="收款类型" clearable>
					<el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value" />
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
			<el-table-column label="订单号" width="320" :show-overflow-tooltip="true" :fixed="is_mobile ? null : 'left'">
				<template slot-scope="scope">
					<span>系统单号：{{scope.row.order_no}}</span><br>
					<span>商户单号：{{scope.row.out_trade_no}}</span>
				</template>
			</el-table-column>
			<el-table-column label="商户" prop="business_id" width="120" />
      <el-table-column  label="收款信息" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span v-if="scope.row.account_type === 1">
            <span> 银行：{{ scope.row.bank }}  </span>
            <span> 支行：{{ scope.row.branch }}</span><br>
            <span> 姓名：{{ scope.row.account_name }} </span>
            <span> 卡号：{{ scope.row.account }}</span>
          </span>
          <span v-if="scope.row.account_type === 2">
              <span>usdt账号：{{ scope.row.account }}</span>
          </span>
          <span v-if="scope.row.account_type === 3">
             <span>支付宝姓名：{{ scope.row.account_name }}</span> <br>
             <span>支付宝账号：{{ scope.row.account }}</span>
          </span>
        </template>
      </el-table-column>
			<el-table-column label="时间" width="300" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>下单时间：{{scope.row.create_time}}</span><br>
					<span>付款时间：{{scope.row.success_time}}</span>
				</template>
			</el-table-column>
			<el-table-column label="商品金额" width="120">
				<template slot-scope="scope">
					<span class="text-danger">{{scope.row.amount}}</span><br>
					<span v-if="scope.row.usdt_amount > 0" class="text-success">U: {{scope.row.usdt_amount}}</span>
				</template>
			</el-table-column>
      <el-table-column label="备注" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <span>下单备注：{{ scope.row.remark }}</span><br>
          <span>支付备注：</span><br>
        </template>
      </el-table-column>
			<el-table-column label="状态" width="140">
				<template slot-scope="scope">
					<span v-if="scope.row.status > 0" :class="scope.row.status_class">已付款</span>
					<span v-else :class="scope.row.status_class">{{scope.row.status_str}}</span>
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
          <el-form-item label="收款类型">
            <el-select v-model="formDetail.account_type" placeholder="类型" clearable >
              <el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>

          <!--          银行卡-->
          <div v-if="formDetail.account_type===1">
            <el-form-item label="">
              <el-input v-model="formDetail.bank" prop="bank" placeholder="请输入银行" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="formDetail.branch" placeholder="请输入银行支行" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="formDetail.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="formDetail.account" placeholder="请输入卡号" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          USDT-->
          <div v-if="formDetail.account_type===2">
            <el-form-item label="">
              <el-input v-model="formDetail.account" placeholder="请输入钱包地址" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          支付宝-->
          <div v-if="formDetail.account_type===3">
            <el-form-item label="">
              <el-input v-model="formDetail.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="formDetail.account" placeholder="请输入账号" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="formDetail.amount" type="number" placeholder="请输入金额" autocomplete="off"
                        @change="changeAmount"/>
            </el-form-item>
          </div>
          <div v-if="formDetail.account_type ===2">
            <el-form-item label="">
              <el-input v-model="formDetail.usdt_amount" placeholder="USDT金额" autocomplete="off" disabled/>
              <p style="margin-top: 0;margin-bottom: -20px"> 换算汇率约为 <span class="text-danger"
              >{{ usdt_rate }}</span> 资料由 OKX 提供</p>
            </el-form-item>
          </div>
          <el-form-item label="">
            <el-input v-model="formDetail.out_trade_no" placeholder="请输入商户订单号" autocomplete="off"/>
          </el-form-item>
					<el-form-item label="金额">
						<el-input-number v-model="formDetail.amount" :controls="false" class="text-left" />
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
            <el-input-number v-model="formSimple.business_id" :controls="false" class="text-left" />
          </el-form-item>
          <el-form-item label="收款类型">
            <el-select v-model="formSimple.account_type" placeholder="类型" clearable :controls="false">
              <el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>

          <!--          银行卡-->
          <div v-if="formSimple.account_type===1">
            <el-form-item label="银行">
              <el-input v-model="formSimple.bank" prop="bank" placeholder="请输入银行" autocomplete="off" />
            </el-form-item>
            <el-form-item label="支行">
              <el-input v-model="formSimple.branch" placeholder="请输入银行支行" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="formSimple.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="账号">
              <el-input v-model="formSimple.account" placeholder="请输入卡号" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          USDT-->
          <div v-if="formSimple.account_type===2">
            <el-form-item label="钱包地址">
              <el-input v-model="formSimple.account" placeholder="请输入钱包地址" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          支付宝-->
          <div v-if="formSimple.account_type===3">
            <el-form-item label="姓名">
              <el-input v-model="formSimple.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="找你嘎哈哦">
              <el-input v-model="formSimple.account" placeholder="请输入账号" autocomplete="off"/>
            </el-form-item>
          </div>
          <el-form-item label="金额">
            <el-input-number v-model="formSimple.amount"  placeholder="请输入金额" :controls="false" @change="changeAmount"/>
          </el-form-item>
          <div v-if="formSimple.account_type ===2">
            <el-form-item label="USDT金额">
              <el-input v-model="formSimple.usdt_amount" placeholder="USDT金额" autocomplete="off" disabled/>
              <p style="margin-top: 0;margin-bottom: -20px"> 换算汇率约为 <span class="text-danger"
              >{{ usdt_rate }}</span> 资料由 OKX 提供</p>
            </el-form-item>
          </div>

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
      usdt_rate:0,


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
				url: "demo_order/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.info = res.data.info;
				that.loading = false;
			});
		},
    changeAmount() {
      let that = this
      if (that.formSimple.account_type === 2) {
        var num = that.formSimple.amount / that.usdt_rate;
        that.formSimple.usdt_amount = num.toFixed(2)
        that.$set(this.formSimple, this.formSimple.usdt_amount, num.toFixed(2))
      }
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
      that.getUsdtRate();
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
    getUsdtRate() {
      let that = this

      that.request({
        url: 'option/get_usdt_rate',
        data: {}
      }).then(res => {
        that.usdt_rate = res.data
      })
    },
	}
};
</script>
<style lang="scss">

</style>
