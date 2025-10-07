<template>
	<div class="app-container">
		<el-form ref="form" :model="form" :rules="rules" label-width="300px" class="mt20">
			<el-row>
				<el-col>
					<el-form-item label="充值通道" prop="recharge_channel">
						<el-radio-group v-model="form.recharge_channel">
							<el-radio v-for="item in rechargeType" :label="item.value">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="Usdt充值地址" prop="recharge_account_usdt">
						<el-input v-model="form.recharge_account_usdt" maxlength="34" show-word-limit autocomplete="off" class="w400px" />
					</el-form-item>
					<el-form-item label="代理余额不足提醒" prop="less_money_notify">
						<el-switch v-model="form.less_money_notify" active-value="1" inactive-value="-1"></el-switch>
					</el-form-item>
					<el-form-item label="代理余额不足允许查看订单" prop="less_money_can_view_order">
						<el-switch v-model="form.less_money_can_view_order" active-value="1" inactive-value="-1"></el-switch>
					</el-form-item>
					<el-form-item label="代理余额不足允许下单" prop="less_money_can_order">
						<el-switch v-model="form.less_money_can_order" active-value="1" inactive-value="-1"></el-switch>
					</el-form-item>
					<el-form-item label="代理余额低于额度不能下单" prop="cannot_order_less_than">
						<el-input-number v-model="form.cannot_order_less_than" :controls="false" class="text-left w210px" />
					</el-form-item>

					<el-form-item v-if="form.is_google_auth" label="谷歌安全码" prop="google_code">
						<el-input v-model="form.google_code" class="w210px" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div class="form-footer footer-setting">
			<el-button type="primary" @click="submitForm">保存设置</el-button>
			<el-button @click="close">关闭</el-button>
		</div>
	</div>
</template>

<script>
export default {
	name: "system_setting",
	data() {
		return {
			form: {},

			// 表单校验
			rules: {

			},
		}
	},
	computed: {
		randomAmount() {
			return this.$store.getters.randomAmount
		},
		rechargeType() {
			return this.$store.getters.rechargeType
		},
	},
	created() {
		this.view();
	},
	methods: {
		view() {
			let that = this

			that.loading = true;
			that.request({
				url: "setting/view",
				data: {},
			}).then(res => {
				that.form = res.data;
				that.loading = false;
			});
		},
		/** 提交按钮 */
		submitForm() {
			let that = this

			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "setting/save",
						data: that.form,
					}).then(res => {
						that.defined.setChangeData(true);
						that.$modal.msgSuccess(res.msg);
						that.close();
					});
				}
			});
		},
		// 取消按钮
		close() {
			this.$tab.closePage();
		},
	}
};
</script>
<style lang="scss">
	.qrcode {
		width: 200px;
		height: 200px;
	}

	.footer-setting {
		margin-left: 290px !important;
	}

	.note {
		margin-left: 10px;
	}
</style>
