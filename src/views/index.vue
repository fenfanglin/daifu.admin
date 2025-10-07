<template>
	<div class="dashboard-editor-container">
		<el-row :gutter="40" class="panel-group">
			<el-col class="card-panel-col">
				<div class="card-panel panel-top">
					<div class="card-panel-description top-panel">
						<div class="card-panel-text">
							登录IP：{{data.log.ip}}，登录地址：{{data.log.area}}，登录时间：{{data.log.create_time}}
						</div>
					</div>
				</div>
			</el-col>
		</el-row>

		<el-row :gutter="40" class="panel-group">
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.total_amount}}</div>
						<div class="card-panel-text">
							平台总出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.today_amout}}</div>
						<div class="card-panel-text">
							今日平台总出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.yesterday_amout}}</div>
						<div class="card-panel-text">
							昨日平台总出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.today_fee}}</div>
						<div class="card-panel-text">
							今日平台总费用
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.yesterday_fee}}</div>
						<div class="card-panel-text">
							昨日平台总费用
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export default {
	name: 'index',
	components: {

	},
	data() {
		return {
			user: {},
			data: {
				log: {},
				info: {},
			},
		}
	},
	created() {
		this.getUserInfo();
		this.loadInfo();
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		loadInfo() {
			let that = this

			that.loading = true;
			that.request({
				url: "index/index",
				data: {},
			}).then(res => {
				that.data = res.data;
				that.loading = false;
			});
		},
	}
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
	padding: 32px;
	// background-color: rgb(240, 242, 245);
	background-color: #f6faff;
	position: relative;
	min-height: calc(100vh - 80px);
}

.panel-group {
	.card-panel-col {
		margin-bottom: 32px;
	}

	.card-panel {
		// cursor: pointer;
		font-size: 12px;
		position: relative;
		overflow: hidden;
		color: #666;
		background: #fff;
		box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
		// border-color: rgba(0, 0, 0, .05);
		border: 0;
		border-radius: 5px;

		.card-panel-description {
			float: left;
			text-align: left;
			margin: 35px;

			.card-panel-text {
				line-height: 25px;
				color: rgba(0, 0, 0, 0.45);
				font-size: 16px;
			}

			.card-panel-num {
				font-size: 30px;
				margin-bottom: 20px;
			}
		}
	}
}

@media (max-width:550px) {
	.card-panel-description {
		// display: none;

		.card-panel-num {
			margin-bottom: 10px !important;
		}
	}

	.card-panel-icon-wrapper {
		float: none !important;
		width: 100%;
		height: 100%;
		margin: 0 !important;
	}
}

.top-panel {
	margin: 25px 35px !important;
}
</style>
