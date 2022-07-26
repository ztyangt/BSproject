# 定时任务
class SchedulerConfig(object):
  SCHEDULER_API_ENABLED = True
  JOBS = [
      {
        'id': 'up_data', # 任务ID
        'func': 'controller.data:up_data', # 执行任务的function名称
        'args': '', #任务参数
        'trigger': {
          'type': 'cron', # 类型
          # 'day_of_week': "0-6", # 可定义具体哪几天要执行
          'hour': '*', # 小时数
          'minute': '0',
          # 'second': '*/3' # "*/3" 表示每3秒执行一次，单独一个"3" 表示每分钟的3秒。
        }
      }
  ]
