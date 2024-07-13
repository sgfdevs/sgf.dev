#!/bin/bash

# Get the directory the script resides in, navigate their, and load env variables
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $__dir
export $(cat .env | xargs)

restic -r $RESTIC_REPOSITORY_PREFIX/sgf.dev backup init

(crontab -l 2>/dev/null; echo "0 6 * * *  /home/ubuntu/sgf/dev/scripts/backup.sh") | crontab -
