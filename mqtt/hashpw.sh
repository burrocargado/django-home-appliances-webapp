#!/bin/sh

docker run --rm -v $PWD/secrets:/tmp/mosquitto eclipse-mosquitto:1.6 mosquitto_passwd -U /tmp/mosquitto/mosquitto.passwd
