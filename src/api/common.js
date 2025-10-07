import request from '@/utils/request'
import { download } from '@/utils/request'

// ---------------------------------------------------------------------------------------------------
export function exportExcel(url, query, fileName) {
	return download(url, {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export const userInfo = async() => {
	return new Promise((resolve) => {
		request({
			url: "index/userinfo",
		}).then(res => {
			if (res.code == 200) {
				resolve(res.data)
			} else {
				resolve(false)
			}
		})
	})
}

export function isMobile() {
	let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
	return flag !== null;
}