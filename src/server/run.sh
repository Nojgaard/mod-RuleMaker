#!/bin/bash
#export PYTHONPATH=$HOME/Projects/mod/stage/lib
export PYTHONPATH=$HOME/Projects/mod/stage/lib
# python3 mod_service.py "$@"
#python3 src/server/mod_service.py 5000
mod --nopost -f src/server/mod_service.py
