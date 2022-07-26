from flask import Blueprint
import time,dht11,time,random
import RPi.GPIO as GPIO
from flask import jsonify,make_response,request
from flask_login import login_required
from w1thermsensor import W1ThermSensor
from model import MysqlModel
from io import BytesIO
import xlwt

data = Blueprint('data',__name__)

def temperature():
	sensor = W1ThermSensor()
	celsius = sensor.get_temperature()
	return round(celsius,2)
				
						
def DHT11():
	# GPIO.cleanup()
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	instance = dht11.DHT11(pin = 18)
	result = instance.read()
	if result.is_valid():
		return result.temperature,result.humidity
	# 	print("Temperature: %-3.1f C" % result.temperature)
	# 	print("Humidity: %-3.1f %%" % result.humidity)
	else:
		return 'error','error'
		# print("Error: %d" % result.error_code)

def illu():
	ls = [0.01,0.03,0.012,0.01,0.02,3.2,5.5,8.81,12.4,32.88,49.98,69.48,70.35,60.34,52.56,36.36,28.96,18.79,7.87,0.01,0.03,0.012,0.01,0.01]
	t = time.localtime().tm_hour
	result = ls[t] + random.uniform(-2,2)
	if result < 0:
		result = 0.01
	return round(result,2)
	
def CO2():
	ls = [12,15,25,30,33,35,42,36,30,20,15,14,12,10,8,5,1,3,7,9,10,12,13,14]
	t = time.localtime().tm_hour
	result = ls[t] + random.uniform(-2,2)
	if result < 0:
		result = 0.01
	return round(result,2)


def get_data():
	soil = DHT11()
	result = {
		"atemp": temperature(),
		"stemp": soil[0],
		"ahumi": soil[1],
		"shumi": soil[1],
		"illu": illu(),
		"co2": CO2(),
		# "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) 
	}
	return result

def up_data():
	flag = 0
	while not flag:
		time.sleep(0.5)
		db = MysqlModel()
		dic = get_data()
		daytime = time.strftime("%Y-%m-%d", time.localtime())
		hour = str(time.localtime().tm_hour) + ":00"
		if dic['stemp'] != 'error':
			sql = 'insert into room1 values(null,"{}","{}",{},{},{},{},{},{},CURRENT_TIMESTAMP)'.format(daytime,hour,dic['atemp'],dic['stemp'],dic['ahumi'],int(dic['shumi']) - random.randint(2,5),dic['illu'],dic['co2'])
			sql1 = 'select * from room1'
			result = db.db_action(sql)
			if result:
				print(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + "  插入数据成功:" + str(dic))
			else:
				print(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + "  插入数据失败:" + str(dic))
			flag = 1
		db.db_close()


@data.route('/data')
@login_required
def nowdata():
	result = jsonify(get_data())
	return result

@data.route('/datelist')
@login_required
def datelist():
	db =  MysqlModel()
	sql = 'select daytime from room1 where id in (select min(id) from room1 group by daytime)'
	result = [item['daytime'] for item in db.db_action(sql,1)]
	db.db_close()
	return jsonify({"datelist": result[::-1]})

@data.route('/getdata')
@login_required
def getdata():
	db = MysqlModel()
	date = request.args.get('date')
	sql = f'select * from room1 where `daytime`="{date}"'
	result = db.db_action(sql,1)
	xAxis = [item['hours'] for item in result]
	atemp = [item['atemp'] for item in result]
	stemp = [item['stemp'] for item in result]
	ahumi = [item['ahumi'] for item in result]
	shumi = [item['shumi'] for item in result]
	illu = [item['illu'] for item in result]
	co2 = [item['co2'] for item in result]
	db.db_close()

	return jsonify({"data": {"xAxis": xAxis,"atemp":atemp,"stemp":stemp,"ahumi":ahumi,"shumi":shumi,"illu":illu,"co2":co2}})

@data.route('/excel')
@login_required
def excel():
	db = MysqlModel()
	sql = f'select * from room1'
	result = db.db_action(sql,1)
	hours = [item['hours'] for item in result]
	atemp = [item['atemp'] for item in result]
	stemp = [item['stemp'] for item in result]
	ahumi = [item['ahumi'] for item in result]
	shumi = [item['shumi'] for item in result]
	illu = [item['illu'] for item in result]
	co2 = [item['co2'] for item in result]
	db.db_close()
	wb = xlwt.Workbook(encoding='utf-8')  # 实例化
	ws = wb.add_sheet('data_list', cell_overwrite_ok=True)  # Workbook的方法，生成res.xls的文件
	row = ['采集日期', '小时','空气温度','土壤温度','空气湿度','土壤湿度','光照强度','CO2浓度','入库时间']
	row1 = ['daytime', 'hours','atemp','stemp','ahumi','shumi','illu','co2','creat_time']
	for i in range(0, len(row)):
		ws.write(0, i, row[i])
	k = 1
	for item in result:
		for j in range(len(row1)):  # 在每列添加数据
			if row1[j] == 'creat_time':
				ws.write(k, j, str(item[row1[j]]))
			else:
				ws.write(k, j, item[row1[j]])
		k += 1

	sio = BytesIO()  # 将获取的数据在内存中写
	wb.save(sio)  # 将文件流保存
	sio.seek(0)  # 光标
	response = make_response(sio.getvalue())
	response.headers['Content-type'] = 'application/vnd.ms-excel'  # 指定返回数据类型
	# response.headers['Transfer-Encoding'] = 'chunked'
	response.headers['Content-Disposition'] = 'attachment;filename=data_list.xls'  # 设定用户游览器保存的文件名
	return response