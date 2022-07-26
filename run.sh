#!/bin/sh
ps -ef | grep python3 | cut -c 9-15| xargs kill -s 9
python3 main.py & python3 video/server.py
