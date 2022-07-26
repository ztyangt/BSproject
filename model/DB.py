import pymysql

class MysqlModel:
	def __init__(self):
		self.ccon = pymysql.connect(
			user='root',
			password='98k282441',
			# host='192.168.2.140',
			host='127.0.0.1',
			port=3306,
			db='BSDATA',
			cursorclass=pymysql.cursors.DictCursor
		)
		self.cursor = self.ccon.cursor()

	def db_action(self,sql=None,flag=None):
		if flag == 1:
			self.cursor.execute(sql)
			return self.cursor.fetchall()
		else:
			try:
				self.cursor.execute(sql)
				self.ccon.commit()
				return True
			except:
				return False

	def db_close(self):
		self.cursor.close()
		self.ccon.close()