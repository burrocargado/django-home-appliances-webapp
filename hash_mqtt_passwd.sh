#!/bin/sh

docker run --rm -v $PWD/config/mosquitto.passwd:/tmp/mosquitto.passwd eclipse-mosquitto:1.6 mosquitto_passwd -U /tmp/mosquitto.passwd
