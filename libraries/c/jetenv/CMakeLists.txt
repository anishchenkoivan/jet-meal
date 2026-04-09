cmake_minimum_required(VERSION 3.28)
project(jetenv VERSION 1.0.0 LANGUAGES C)

# -----------------------------------------------------------------------------
# Library
# -----------------------------------------------------------------------------
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_THREAD_PREFER_PTHREAD TRUE)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

file(GLOB SOURCES src/*.c)
file(GLOB HEADERS src/*.h)

add_library(jetenv ${SOURCES})

target_include_directories(jetenv
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

set_target_properties(jetenv PROPERTIES
    POSITION_INDEPENDENT_CODE ON
)

# -----------------------------------------------------------------------------
# Sample service for tests (optional)
# -----------------------------------------------------------------------------
option(BUILD_SAMPLE_SERVICE "Build sample service for tests" OFF)

if(BUILD_SAMPLE_SERVICE)
    file(GLOB SAMPLE_SOURCES src/*.c sample-service/src/*.c)

    add_executable(jetenv-sample-service ${SAMPLE_SOURCES})

    target_include_directories(jetenv-sample-service
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include/
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/sample-service/src
    )

    add_compile_options(-fsanitize=address -fsanitize=thread)
    add_link_options(-fsanitize=address -fsanitize=thread)
endif()
