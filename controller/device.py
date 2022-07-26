import RPi.GPIO as GPIO 
from flask import jsonify,request
from flask_login import login_required
from flask import Blueprint

device = Blueprint('device',__name__)


@device.route('/light')
@login_required
def light():
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(27,GPIO.OUT)
	sw = GPIO.input(27)
	if sw == 1:
		GPIO.output(27,0)
	else:
		GPIO.output(27,1)
	gpio27 = GPIO.input(27)
	return jsonify({"status": gpio27})



@device.route('/status')
@login_required
def status():
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	port = int(request.args.get('port'))
	GPIO.setup(port,GPIO.OUT)
	st = GPIO.input(port)
	return jsonify({"status": st})


