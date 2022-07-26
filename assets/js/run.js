function getLongDate(){
	var dateObj = new Date();
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth() + 1;
	var date = dateObj.getDate();
	var day = dateObj.getDay();
	var weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var week = weeks[day];
	var hour = dateObj.getHours();
	var minute = dateObj.getMinutes();
	var second = dateObj.getSeconds();
	if (month<10) {
		month="0"+month;
	}
	if (date<10) {
		date="0"+date;
	}
	if (hour<10) {
		hour="0"+hour;
	}
	if (minute<10) {
		minute="0"+minute;
	}
	if (second<10) {
		second="0"+second;
	}
	var newDate=year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
	document.getElementById("dateStr").innerHTML=newDate;
	setTimeout("getLongDate()",1000);//每隔一秒重新调用一次该函数
}

getLongDate()
var pad = function() {
var tbl = [];
return function(num, n) {
 	var len = n-num.toString().length;
  	if (len <= 0) return num;
  	if (!tbl[len]) tbl[len] = (new Array(len+1)).join('0');
  	return tbl[len] + num;
 }
}();
let date = new Date();


var app = new Vue({
	delimiters:['[[', ']]'],
	el: "#app",
	data: {
		selected: 1,
		isMask: false,
		checked1: false,
		atemp: 20,
		ahumi: 40,
		illu: 40,
		co2: 5,
		dateList: [],
		xAxis: [],
		atempList: [],
		stempList: [],
		ahumiList: [],		
		shumiList: [],		
		illuList: [],		
		co2List: [],
		options: [
		  { text: '一号温室', value: 1,id :'room-1',show: true},
		  { text: '二号温室', value: 2,id :'room-2',show: false},
		  { text: '三号温室', value: 3,id :'room-3',show: false}
		],
	},
	mounted(){
		this.setMyEchart();
		this.gpio27();
		this.video();
		this.getdateList();
		this.wsfunc();
	},
    beforeDestroy() {
    	clearInterval(this.timer);
    },
	methods: {
		// datafunc1: function(){
		// 	var that = this;
		// 	axios.get("/data").then(
  //       		function(response) {
  //       			data = response.data;
  //       			that.atemp = data.atemp;
  //       			that.illu = data.illu;
  //       			that.co2 = data.co2;
  //       			if(data.ahumi != 'error'){
  //       				that.ahumi = data.ahumi;
  //       			}
  //       	},function(err) {});
		// },
		wsfunc: function(){
			var that = this;
			var namespace = '/nowdata';
			var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace, {transports: ['websocket']});
			socket.on('server_response', function(res) {
			    // console.log(res.data);
			    data = res.data;
				that.atemp = data.atemp;
				that.illu = data.illu;
				that.co2 = data.co2;
				if(data.ahumi != 'error'){
					that.ahumi = data.ahumi;
				}			    
			});
    	},
		getdateList: function(){
			var that = this;
			axios.get("/datelist").then(
        		function(response) {
        			that.dateList = response.data.datelist;
        	},function(err) {});			
		},
		getValue: function(){
			console.log(this.selected);
		},
		startCharts: function(date){
			var that = this;
			axios.get("/getdata?date="+date).then(
        		function(response) {
        			that.xAxis = response.data.data.xAxis;
        			that.atempList = response.data.data.atemp;
        			that.stempList = response.data.data.stemp;
        			that.ahumiList = response.data.data.ahumi;
        			that.shumiList = response.data.data.shumi;
        			that.illuList = response.data.data.illu;
        			that.co2List = response.data.data.co2;
        			that.hisData();
        	},function(err) {});				
		},
		draw: function(event){
			var that = this;
			var date = event.target.value;
			console.log(date);
			axios.get("/getdata?date="+date).then(
        		function(response) {
        			that.xAxis = response.data.data.xAxis;
        			that.atempList = response.data.data.atemp;
        			that.stempList = response.data.data.stemp;
        			that.ahumiList = response.data.data.ahumi;
        			that.shumiList = response.data.data.shumi;
        			that.illuList = response.data.data.illu;
        			that.co2List = response.data.data.co2;
        			that.hisData();
        	},function(err) {});			
		},
		showMask: function(){
			this.isMask = true;
		},
		removeMask: function(){
			this.isMask = false
		},
		btnLight: function(){
			axios.get("/light").then(
        		function(response) {
          			console.log(response.data);
        	},function(err) {});					
		},
		gpio27: function(){
			var that = this;
			axios.get("/status?port=27").then(
        		function(response) {
        			if (response.data.status == 1) {
        				that.checked1=true;
        			}
        	},function(err) {});			
		},
		switchTab: function(id){
			for(j = 0; j < this.options.length; j++) {
				op = this.options[j]
				if(op.value == id) {
					op.show = true;
				}else{
					op.show= false;
				}
			}
		},
		video: function(){
			var canvas = document.getElementById('videoCanvas');
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = '${COLOR}';
			ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);
			var client = new WebSocket('ws://'+ document.domain +':8084/');
			var player = new jsmpeg(client, {canvas:canvas});
		},
		setMyEchart: function(){
			var that = this;
			// 温度
			var Temp = document.getElementById('temp');
			var temp = echarts.init(Temp);
			var option1;
			option1 = {
			    series: [{
			            type: 'gauge',
			            startAngle: 210,
			            endAngle: -30,
			            min: 0,
			            max: 60,
			            splitNumber: 6,
			            itemStyle: {
			                color: '#FFAB91'
			            },
			            progress: {
			                show: true,
			                width: 5
			            },
						pointer: {
							length: '75%',
							width: 3,
							offsetCenter: [0, '5%']
			            },
			            axisLine: {
			                lineStyle: {
			                    width: 5
			                }
			            },
			            axisTick: {
			                distance: -10,
			                splitNumber: 5,
			                lineStyle: {
			                    width: 2,
			                    color: '#999'
			                }
			            },
			            splitLine: {
			                distance: -10,
			                length: 5,
			                lineStyle: {
			                    width: 3,
			                    color: '#999'
			                }
			            },
			            axisLabel: {
			                distance: -15,
			                color: '#999',
			                fontSize: ".7rem"
			            },
			            anchor: {
			                show: false
			            },
			            title: {
			                show: false
			            },
			            detail: {
			                valueAnimation: true,
			                width: '60%',
			                lineHeight: 20,
			                height: '15%',
			                borderRadius: 8,
			                offsetCenter: [0, 30],
			                fontSize: ".8rem",
			                fontWeight: 'bolder',
			                formatter: "温度\n{value} °C",
			                color: 'auto'
			            },
			            data: [{
			                value: that.atemp,
			            }]
			        },
			    ],
			};
			temp.setOption(option1, true);
			setInterval(function () {
				option1.series[0].data[0].value = that.atemp;
			    temp.setOption(option1, true);
			}, 100);			
			// --------湿度-------
			var Hum = document.getElementById('hum');
			var hum = echarts.init(Hum);
			var option2;
			
			option2 = {
			    series: [{
			        type: 'gauge',
			        splitNumber: 5,
			        startAngle: 210,
			        endAngle: -30,
			        axisLine: {
			            lineStyle: {
			                width: 5,
			                color: [
			                    [0.2, '#2997f7'],
			                    [0.8, '#34dc15'],
			                    [1, '#ffa500']
			                ]
			            }
			        },
			        pointer: {
			            length: '75%',
			            width: 3,
			            offsetCenter: [0, '5%']
			        },
			        axisTick: {
			            distance: -10,
			            length: 5,
			            lineStyle: {
			                color: '#fff',
			                width: 2
			            }
			        },
			        splitLine: {
			            distance: -10,
			            length: 5,
			            lineStyle: {
			                color: '#fff',
			                width: 2
			            }
			        },
			        axisLabel: {
			            color: 'auto',
			            distance: -15,
			            fontSize: 10
			        },
			        detail: {
						lineHeight: 20,
						offsetCenter: [0, 30],
			            valueAnimation: true,
			            formatter: '湿度\n{value} %',
			            color: 'auto',
			            fontSize: ".8rem",
			        },
			        data: [{
			            value: that.ahumi
			        }]
			    }]
			};
			
			option2 && hum.setOption(option2);
			setInterval(function () {
			    // option2.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
			    option2.series[0].data[0].value = that.ahumi;
			    hum.setOption(option2, true);
			}, 100);
			// --------光照-------
			var Light = document.getElementById('light');
			var light = echarts.init(Light);
			var option3;
			
			option3 = {
			    series: [{
			        type: 'gauge',
			        startAngle: 210,
			        endAngle: -30,
			        min: 0,
			        max: 240,
			        splitNumber: 6,
			        itemStyle: {
			            color: '#58D9F9',
			            shadowColor: 'rgba(0,138,255,0.45)',
			            shadowBlur: 10,
			            shadowOffsetX: 2,
			            shadowOffsetY: 2
			        },
			        pointer: {
			            length: '75%',
			            width: 3,
			            offsetCenter: [0, '5%']
			        },
			        progress: {
			            show: true,
			            roundCap: true,
			            width: 5
			        },
			        pointer: {
			            length: '75%',
			            width: 3,
			            offsetCenter: [0, '5%']
			        },
			        axisLine: {
			            roundCap: true,
			            lineStyle: {
			                width: 5
			            }
			        },
			        axisTick: {
						distance:-10,
			            splitNumber: 5,
			            lineStyle: {
			                width: 1,
			                color: '#999'
			            }
			        },
			        splitLine: {
			            length: 6,
						distance: -10,
			            lineStyle: {
			                width: 3,
			                color: '#999'
			            }
			        },
			        axisLabel: {
			            distance: -13,
			            color: '#999',
			            fontSize: 10
			        },
			        title: {
			            show: false
			        },
			        detail: {
			            borderColor: '#999',
			            borderWidth: 0,
			            width: 0,
			            lineHeight: 20,
			            height: 0,
			            borderRadius: 0,
			            offsetCenter: [0, 30],
			            valueAnimation: true,
						fontSize: ".8rem",
						color: "orange",
			            formatter: '光照/100lux\n{value}',
			        },
			        data: [{
			            value: that.illu
			        }]
			    }]
			};
			
			option3 && light.setOption(option3);
			setInterval(function () {
			    // option2.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
			    option3.series[0].data[0].value = that.illu;
			    option3 && light.setOption(option3);
			}, 800);


			var CO2 = document.getElementById('co2');
			var co2 = echarts.init(CO2);
			var option4;
			// --------CO2浓度---------
			option4 = {
			    tooltip: {
			        formatter: '{a} <br/>{b} : {c}%'
			    },
			    series: [{
			        name: 'Pressure',
			        type: 'gauge',
					startAngle: 210,
					endAngle: -30,
					splitNumber: 5,
			        detail: {
						lineHeight: 20,
						offsetCenter: [0, 30],
						valueAnimation: true,
						fontSize: ".8rem",
						color: "#03a9f4",
						formatter: 'CO2浓度\n{value}',
			        },
			        pointer: {
			            length: '75%',
			            width: 3,
			            offsetCenter: [0, '5%']
			        },        
			        progress: {
			            show: true,
			            roundCap: true,
			            width: 5
			        },
			        axisLine: {
			            roundCap: true,
			            lineStyle: {
			                width: 5
			            }
			        },
			        axisTick: {
						distance:-10,
			            splitNumber: 5,
			            lineStyle: {
			                width: 1,
			                color: '#999'
			            }
			        },
			        splitLine: {
			            length: 6,
						distance: -10,
			            lineStyle: {
			                width: 3,
			                color: '#999'
			            }
			        },
			        axisLabel: {
			            distance: -15,
			            color: '#999',
			            fontSize: 10
			        },
			        data: [{
			            value: that.co2,
			        }]
			    }]
			};
			
			option4 && co2.setOption(option4);
			setInterval(function () {
			    option4.series[0].data[0].value = that.co2;
			    option4 && co2.setOption(option4);
			}, 800);


			var Bar = document.getElementById('device-right');
			var bar = echarts.init(Bar);
			var option5;
			
			option5 = {
			    xAxis: {
			        type: 'category',
			        data: ['空气', '土壤', '光照', '视频'],
					axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					} 
			    },
			    yAxis: {
					splitLine: {
						show:false
					},
					axisLine: {
						 show: true,
						 lineStyle:{
							color:'#b3bcf3',
						 }
					},
			        type: 'value'
			    },
				grid: {
					show: false,
					top:10,
					bottom: 20,
					left: 30,
					right: 5,
				},
				tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
				 },
			    series: [{
			        data: [6, 12, 5, 8],
			        type: 'bar',
			    }],
				tooltip: {
				        show:true,
						trigger: 'axis',
						backgroundColor: "rgba(0,0,0,0.4)",
						borderWidth: 0, 
						textStyle: {
							color: "#fff"
						},
						color: 	'auto',
				        formatter: "{b}:{c} 台",
				    },
			};
			
			option5 && bar.setOption(option5);
			
			
			// 空气温度走势
			var Atemp = document.getElementById('atemp');
			var atemp = echarts.init(Atemp);
			var option7;
			
			option7 = {
			   title: {
			        text: '温度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff",
						fontSize:12
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ],
				 
			};
			
			option7 && atemp.setOption(option7);
			
			
			// 空气湿度走势
			var Ahum = document.getElementById('ahum');
			var ahum = echarts.init(Ahum);
			var option8;
			
			option8 = {
			   title: {
			        text: '湿度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5,
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ],
			};
			
			option8 && ahum.setOption(option8);
			
			
			// 土壤温度走势
			var Stemp = document.getElementById('stemp');
			var stemp = echarts.init(Stemp);
			var option9;
			
			option9 = {
			   title: {
			        text: '温度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ]
			};
			
			option9 && stemp.setOption(option9);
			
			
			// 空气湿度走势
			var Shum = document.getElementById('shum');
			var shum = echarts.init(Shum);
			var option10;
			
			option10 = {
			   title: {
			        text: '湿度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5,
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ]
			};
			
			option10 && shum.setOption(option10);
			
			// 光照强度走势
			Billu = document.getElementById('billu');
			var billu = echarts.init(Billu);
			var option10;
			
			option11 = {
			   title: {
			        text: '光照强度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5,
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ]
			};
			
			option11 && billu.setOption(option11);
			
			// CO2浓度走势
			Bco2 = document.getElementById('bco2');
			var bco2 = echarts.init(Bco2);
			var option12;
			
			option12 = {
			   title: {
			        text: 'CO2浓度',
					left: 30,
					textStyle: {
						fontSize:12,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff"
					},
			     },
				grid: {
					show: false,
					top:10,
					bottom: 30,
					left: 30,
					right: 5,
				},
			     xAxis: {
			         type: 'category',
			         data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 0,
					top: -5,
					data: ['一号温室', '二号温室','三号温室'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 10,
						size: 10,
					}
				},
			     series: [
					{
						name: "一号温室",
						data: [15, 23, 24, 28, 35, 17, 26],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 1
								}
							},
						},
					},
					{
						name: "二号温室",
						data: [10, 29, 20, 20, 30, 19, 20],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 1
								}
							},
						},
					},
					{
						name: "三号温室",
						data: [40, 49, 10, 29, 39, 11, 9],
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#55ff7f",
									 width: 1
								}
							},
						},
					}
					
				 ]
			};
			
			option12 && bco2.setOption(option12);
		},
	hisData: function(){
			this.showMask();
			var that = this;
			// 温度历史数据
			var temperature = document.getElementById('temperature');
			var ht = echarts.init(temperature);
			var option13;
			
			option13 = {
			   title: {
			        text: '温度走势',
					left: 30,
					top:10,
					textStyle: {
						fontSize:14,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff",
						fontSize:12
					},
			     },
				grid: {
					show: false,
					top:40,
					bottom: 60,
					left: 30,
					right: 10
				},
			     xAxis: {
			         type: 'category',
			         data: that.xAxis,
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 20,
					top: 10,
					data: ['空气温度', '土壤温度'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 14,
					}
				},
				dataZoom: [{
				    height: 15,
				    startValue: pad((date.getHours()-8),2).toString()+ ":00",
				    bottom: 20,
				    textStyle: {
						color: "#ffffff"
				    },
				}, {
				    type: 'inside',
				}],
			     series: [
					{
						name: "空气温度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.atempList,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 2
								}
							},
						},
					},
					{
						name: "土壤温度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.stempList ,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 2
								}
							},
						},
					}
					
				 ],
				 
			};
			ht.clear()
			option13 && ht.setOption(option13);
			
			
			// 湿度历史数据
			var humidity = document.getElementById('humidity');
			var hh = echarts.init(humidity);
			var option14;
			
			option14 = {
			   title: {
			        text: '湿度走势',
					left: 30,
					top:10,
					textStyle: {
						fontSize:14,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff",
						fontSize:12
					},
			     },
				grid: {
					show: false,
					top:40,
					bottom: 60,
					left: 30,
					right: 10
				},
			     xAxis: {
			         type: 'category',
			         data: that.xAxis,
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 20,
					top: 10,
					data: ['空气湿度', '土壤湿度'],
					textStyle: {
						color: "#49b7f0",
						fontSize: 14,
					}
				},
				dataZoom: [{
				    height: 15,
				    startValue: pad((date.getHours()-8),2).toString()+ ":00",
				    bottom: 20,
				    textStyle: {
						color: "#ffffff"
				    },
				}, {
				    type: 'inside',
				}],
			     series: [
					{
						name: "空气湿度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.ahumiList,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 2
								}
							},
						},
					},
					{
						name: "土壤湿度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.shumiList,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#0055ff",
									 width: 2
								}
							},
						},
					}
					
				 ],
				 
			};
			hh.clear();
			option14 && hh.setOption(option14);
			
			// 光照历史数据
			var illumination = document.getElementById('illumination');
			var hi = echarts.init(illumination);
			var option15;
						
			option15 = {
			   title: {
			        text: '光照强度走势',
					left: 30,
					top:10,
					textStyle: {
						fontSize:14,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff",
						fontSize:12
					},
			     },
				grid: {
					show: false,
					top:40,
					bottom: 60,
					left: 30,
					right: 10
				},
			     xAxis: {
			         type: 'category',
			         data: that.xAxis,
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 20,
					top: 10,
					textStyle: {
						color: "#49b7f0",
						fontSize: 14,
					}
				},
				dataZoom: [{
				    height: 15,
				    startValue: pad((date.getHours()-8),2).toString()+ ":00",
				    bottom: 20,
				    textStyle: {
						color: "#ffffff"
				    },
				}, {
				    type: 'inside',
				}],
			     series: [
					{
						name: "光照强度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.illuList,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 2
								}
							},
						},
					}
					
				 ],
				 
			};
			hi.clear()
			option15 && hi.setOption(option15);
			
			// 二氧化碳浓度历史数据
			var carbon = document.getElementById('carbon');
			var hc = echarts.init(carbon);
			var option16;
						
			option16 = {
			   title: {
			        text: '二氧化碳浓度走势',
					left: 30,
					top:10,
					textStyle: {
						fontSize:14,
						color: "#49b7f0"
					}
			    },
			    tooltip: {
					trigger: 'axis',
					backgroundColor: "rgba(0,0,0,0.4)",
					borderWidth: 0, 
					textStyle: {
						color: "#fff",
						fontSize:12
					},
			     },
				grid: {
					show: false,
					top:40,
					bottom: 60,
					left: 30,
					right: 10
				},
			     xAxis: {
			         type: 'category',
			         data: that.xAxis,
					 axisLine:{
						 lineStyle:{
							 color:'#b3bcf3',
						 }
					 } 
			     },
			     yAxis: {
			         type: 'value',
					 splitLine: {
						 show:false
					 },
					 axisLine: {
						 show: true,
						 lineStyle:{
						 	color:'#b3bcf3',
						 }
					 },
			     },
				legend: {
					right: 20,
					top: 10,
					textStyle: {
						color: "#49b7f0",
						fontSize: 14,
					}
				},
				dataZoom: [{
				    height: 15,
				    startValue: pad((date.getHours()-8),2).toString()+ ":00",
				    bottom: 20,
				    textStyle: {
						color: "#ffffff"
				    },
				}, {
				    type: 'inside',
				}],
			     series: [
					{
						name: "二氧化碳浓度",
						smooth: true,
						areaStyle: {opacity: 0.1},
						data: that.co2List,
						type: 'line',
						itemStyle: {
							normal: {
								lineStyle: {
									 color: "#ffab02",
									 width: 2
								}
							},
						},
					}
					
				 ],
				 
			};
			hc.clear()
			option16 && hc.setOption(option16);
	}
	}

})


