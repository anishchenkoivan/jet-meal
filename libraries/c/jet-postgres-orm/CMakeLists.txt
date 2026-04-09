cmake_minimum_required(VERSION 3.28)
project(jet-postgres-orm VERSION 1.0.0 LANGUAGES C)

# -----------------------------------------------------------------------------
# Library
# -----------------------------------------------------------------------------
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Add POSIX feature test macro (2008 edition is common)
add_compile_definitions(_POSIX_C_SOURCE=200809L)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_THREAD_PREFER_PTHREAD TRUE)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

file(GLOB SOURCES src/*.c)
file(GLOB HEADERS src/*.h)

add_library(jet-postgres-orm ${SOURCES})
target_include_directories(jet-postgres-orm
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/../jet-orm/include
)

set_target_properties(jet-postgres-orm PROPERTIES
    POSITION_INDEPENDENT_CODE ON
)

find_package(PostgreSQL REQUIRED)
target_include_directories(jet-postgres-orm PRIVATE ${PostgreSQL_INCLUDE_DIRS})

# -----------------------------------------------------------------------------
# Sample service for tests (optional)
# -----------------------------------------------------------------------------
option(BUILD_SAMPLE_SERVICE "Build sample service for tests" OFF)

if(BUILD_SAMPLE_SERVICE)
    file(GLOB SAMPLE_SOURCES src/*.c sample-service/src/*.c)

    add_executable(jet-postgres-orm-sample-service ${SAMPLE_SOURCES})

    target_include_directories(jet-postgres-orm-sample-service
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include/
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/sample-service/src
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/../jet-orm/
    )

    add_compile_options(-fsanitize=address -fsanitize=thread)
    add_link_options(-fsanitize=address -fsanitize=thread)
endif()
