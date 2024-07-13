#!/bin/bash

# Get the directory the script resides in, navigate their, and load env variables
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $__dir
export $(cat .env | xargs)


cd ..

restic -r $RESTIC_REPOSITORY_PREFIX/sgf.dev backup \
    ./.env \
    ./SgfDevs/umbraco/Data/Umbraco.sqlite.db

