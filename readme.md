## 1. 安装openssh

win10安装openssh，让cmd命令行支持ssh以远程登录树莓派

[下载地址](https://www.mls-software.com/opensshd.html)

![](https://qiniu.ztyang.com/img/20220726090414.png)

## 2. ssh登录树莓派

使用ssh登录树莓派，需要获得树莓派的IP地址。win10打开终端，输入命令远程登录树莓派：

```bash
ssh pi@树莓派ip
```

默认密码为 `raspberry` ，输入密码登录树莓派：

![](https://qiniu.ztyang.com/img/20220726090642.png)

### 2.1 首次登录

登录树莓派需要获得树莓派IP地址，树莓派联网有两种方式：

+ **有线**：使用网线连接。

+ **无线**：WiFi

树莓派连上网络之后，可以在路由器后台管理界面查到树莓派的IP地址。

在没有网线和显示器的情况下，这里提供一种简单的方式供使用者第一次登录树莓派：树莓派里预置了一条WiFi连接信息，如下所示：

```json
network={
    ssid="wifi"
    psk="25802580"
}
```

`ssid`为WiF名称，`psk`为Wif密码，首次登录树莓派时可以用手机开启热点，并将热点名字改为"wifi",密码改为"25802580"，树莓派开机后会自动连上手机热点，然后在手机里面**热点连接设备**信息里面可以看到树莓派IP，接下来使用上面介绍的方法登录树莓派。

### 2.2 配置WiFi信息

第一次成功登录树莓派之后，需要配置WiFi信息，供树莓派登录时自动连接。树莓派WiFi配置文件为`/etc/wpa_supplicant/wpa_supplicant.conf`,打开这个文件，在里面添加WiFi信息，树莓派开机时会自动连上。添加WiFi信息的格式：

```json
network={
    ssid="wifi名字"
    psk="wifi密码"
}
```

> 预置的wifi信息作用很大，请不要删除！经过实验，5GHz频段的WiFi无法连接，配置WiFi信息时请填写2.4G频段的

### 2.3 开机推送IP地址

树莓派连上网之后，可以在路由器后台管理界面查看IP地址。也可以固定IP地址，但是固定IP地址会有连接冲突的风险，导致树莓派联网失败。这里配置了开机推送IP地址的功能，推送方式为免费的邮件推送。

**使用方法**：在树莓派登录成功之后，打开文件`/home/pi/start/start.py`，将56行代码中的邮箱改成自己的：

![](https://qiniu.ztyang.com/img/code2121212.png)

这样再树莓派开机并成功连上网络之后，会给设置的邮箱推送树莓派IP地址，效果如下：

![](https://qiniu.ztyang.com/img/20220726091853.png-yasuo)

> 树莓派开机需要一定时间才能连上网络，为了避免在未连接上网络时就执行了邮件推送程序，程序里设置了15s的延迟，树莓派上电15s之后才能收到邮件信息，请耐心等待。

****

## 3. 云平台系统运行

项目文件夹路径为`/home/pi/BSproject`:

```bash
├── assets
│   ├── css
│   │   ├── animation.css
│   │   ├── button.css
│   │   ├── login.css
│   │   └── style.css
│   ├── images
│   │   ├── admin.svg
│   │   ├── bg1.png
│   │   ├── bg.png
│   │   ├── bnt.png
│   │   ├── close.svg
│   │   ├── favicon.ico
│   │   ├── login_bg.jpg
│   │   ├── point1.svg
│   │   ├── point2.svg
│   │   ├── point.svg
│   │   └── school_logo.png
│   └── js
│       ├── animation.js
│       ├── axios.min.js
│       ├── echarts.min.js
│       ├── jquery.min.js
│       ├── jsmpg.js
│       ├── run.js
│       └── vue.js
├── common
│   ├── Config.py
│   ├── __init__.py
│   ├── LCD.py
│   ├── Notice.py
│   ├── __pycache__
│   │   ├── Config.cpython-37.pyc
│   │   ├── __init__.cpython-37.pyc
│   │   ├── Notice.cpython-37.pyc
│   │   └── User.cpython-37.pyc
│   └── User.py
├── controller
│   ├── data.py
│   ├── device.py
│   ├── __init__.py
│   └── __pycache__
│       ├── data.cpython-37.pyc
│       ├── device.cpython-37.pyc
│       └── __init__.cpython-37.pyc
├── main.py
├── model
│   ├── DB.py
│   ├── __init__.py
│   └── __pycache__
│       ├── DB.cpython-37.pyc
│       └── __init__.cpython-37.pyc
├── requirements.txt
├── run.sh
├── video
│   ├── index.html
│   ├── jsmpg.js
│   └── server.py
└── views
    ├── index.html
    └── login.html
```

项目根目录下有一启动脚本`run.sh`，启动云平台系统只需执行启动脚本即可，执行以下命令：

```bash
./run.sh
```

![](https://qiniu.ztyang.com/img/20220726091942.png)

没有报错，说明系统正常运行。使用Chrome或新版Edge浏览器，输入地址`树莓派ip:5000`打开可看到效果：

![](https://qiniu.ztyang.com/img/20220726092018.png)

> 管理员用户名: admin   密码:  123456
