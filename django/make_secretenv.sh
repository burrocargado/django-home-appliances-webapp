#!/bin/bash

if ! [ -f secrets/env ] ; then
    docker run --rm -v $PWD/app:/app burrocargado/hawebapp python3 makesecretkey.py > secrets/env
fi
