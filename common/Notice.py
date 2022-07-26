import requests
from smtplib import SMTP_SSL
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr


class SendMsg:
	def smtp(self,receiver,text):
		content = text
		message = MIMEText(content,'html')
		message['Subject'] = Header('智慧农业控制系统云平台','utf-8')
		message['From'] = formataddr(["报警详情",'yang2210670@qq.com'])
		message['To'] = receiver
		smtpObj = SMTP_SSL('smtp.qq.com')
		smtpObj.login(user='yang2210670@qq.com', password='nbfwjsmatmqhebgf')
		smtpObj.sendmail('yang2210670@qq.com',receiver,str(message))
		smtpObj.quit()
		print("邮件发送成功")

	def weixin(self,userid,text):
		api = "https://msg.ucool.icu/send/"
		payload = {
			"userid": "zhangtongyang",
			"msgtype": "news",
			"title": "智慧农业控制系统云平台",
			"description": text,
			# "picurl": "http://p0.qhimg.com/bdr/__85/t017f1ca20da2689774.jpg"
			# "picurl": "http://p4.qhimg.com/bdr/__85/t01cabd0b32a8e915f6.jpg"
		}
		res = requests.post(api,data = payload)
		print("微信推送成功")

