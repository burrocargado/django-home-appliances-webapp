#!/bin/bash

docker run --rm -v $PWD/django/app:/app burrocargado/hawebapp python3 makesecretkey.py
