import os,time
from flask import Flask,jsonify,send_from_directory,request,render_template,redirect,url_for,flash,session
from flask_login import login_user,logout_user,LoginManager,login_required,current_user
from werkzeug.security import generate_password_hash
from common import User,SchedulerConfig
from flask_apscheduler import APScheduler
from flask_socketio import SocketIO,emit
from threading import Lock
# import common.LCD as LCD
from common import SendMsg

app = Flask(__name__,template_folder='views',static_url_path='',static_folder='assets')
app.config["SECRET_KEY"] = os.urandom(24) #随机数种子，产生SessionID 
app.config.from_object(SchedulerConfig()) #注册定时任务
socketio = SocketIO()
socketio.init_app(app,cors_allowed_origins = '*')
thread = None
thread_lock = Lock()


login_manager = LoginManager(app)  
login_manager.login_view = 'login'

@app.route('/')
@login_required
def index():
	return render_template("index.html")


# 分配管理员列表
user_list = [  
		{'id': 1,'username': 'admin','password': generate_password_hash('123456')},
		{'id': 2,'username': 'admin2','password': generate_password_hash('123456')}
	]

@login_manager.user_loader
def load_user(user_id):  # 创建用户加载回调函数，接受用户 ID 作为参数
	return User.get(user_id,user_list)

@app.route('/login',methods=['GET','POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('index'))
	if request.method == 'POST':
		username = request.form.get("username",None)
		password = request.form.get("password",None)
		if not username or not password:
			return redirect(url_for('login'))
		user_info = [u for u in user_list if u['username'] == username]
		if len(user_info) > 0:
			user_info = user_info[0]
			user = User(user_info)
			if user.verify_password(password):
				session.clear()
				login_user(user)
				return redirect(url_for('index'))
		flash('用户名或密码错误')  # 如果验证失败，显示错误消息
		return redirect(url_for('login'))  # 重定向回登录页面
	return render_template("login.html")

@app.route('/logout')
@login_required
def logout():
	logout_user()
	return redirect(url_for('login'))

@app.route('/favicon.ico')
def favicon():
	return send_from_directory(os.path.join(app.root_path, 'assets'),'images/favicon.ico', mimetype='image/vnd.microsoft.icon')

@socketio.on('connect', namespace='/nowdata')
def test_connect():
	global thread
	with thread_lock:
		if thread is None:
			thread = socketio.start_background_task(target=background_thread)

def background_thread():
	from controller import get_data
	# LCD.init_lcd()
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(17,GPIO.OUT)	
	GPIO.setup(22,GPIO.OUT)	
	stemp = 1
	while True:
		result = get_data()
		# LCD.print_lcd(0, 0, "AT:%.1f" % result['atemp'])
		# if result['ahumi'] != 'error':
		# 	LCD.print_lcd(9, 0, "AH:%.1f" % result['ahumi'])
		# LCD.print_lcd(0, 1, "IL:%.1f" % result['illu'])
		# LCD.print_lcd(9, 1, "CO:%.1f" % result['co2'])
		socketio.emit('server_response',{'data': result},namespace='/nowdata')
		if int(result['atemp']) >= 28:
			time.sleep(0.8)
			GPIO.output(17,1)
			GPIO.output(22,1)
			send = SendMsg()
			if stemp:
				send.smtp("2251513837@qq.com",'<span style="font-size:2rem;color:red;">警报！！！</span><br>温度过高！！！')
				send.weixin("zhangtongyang","警报，温度过高！！！")
			stemp = 0
		else:
			stemp = 1
			GPIO.output(17,0)
			GPIO.output(22,0)
		socketio.sleep(2)


if __name__ == '__main__':
	from controller import *
	app.register_blueprint(device)
	app.register_blueprint(data)
	scheduler = APScheduler()  # 实例化APScheduler
	scheduler.init_app(app)  # 把任务列表载入实例flask
	scheduler.start()  # 启动定时任务
	# app.run(host="0.0.0.0",port=5000,debug=False)
	# socketio.run(app,debug=True,host='0.0.0.0',port=5000)
	socketio.run(app,debug=False,host='0.0.0.0',port=5000)
