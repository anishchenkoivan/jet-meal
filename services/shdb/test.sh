#!/bin/bash

SCRIPT_DIR_NAME=$(dirname "$0")
TEST_TARGET_NAME=$1

echo "Test target name $TEST_TARGET_NAME"

function test_configuration # CONFIGURATION_CMAKE_FLAGS
{
    CONFIGURATION_CMAKE_FLAGS=$1
    FOLDER=$2
    echo "Test configuration $CONFIGURATION_CMAKE_FLAGS"

    if (mkdir -p $SCRIPT_DIR_NAME/$FOLDER && cd $SCRIPT_DIR_NAME/$FOLDER && cmake .. $CONFIGURATION_CMAKE_FLAGS && make -j8 $TEST_TARGET_NAME && tests/$TEST_TARGET_NAME)
    then
        echo "Tests passed for configuration $CONFIGURATION_CMAKE_FLAGS"
    else
        echo "Tests failed for configuration $CONFIGURATION_CMAKE_FLAGS"
        exit 1
    fi
}

test_configuration "-DCMAKE_BUILD_TYPE=Debug" build_debug
test_configuration "-DCMAKE_BUILD_TYPE=Debug -DSANITIZE=address" build_debug_asan
test_configuration "-DCMAKE_BUILD_TYPE=RelWithDebInfo" build_release
test_configuration "-DCMAKE_BUILD_TYPE=RelWithDebInfo -DSANITIZE=address" build_release_asan
