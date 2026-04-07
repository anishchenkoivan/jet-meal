cmake_minimum_required(VERSION 3.28)
project(facil-io-router VERSION 1.0.0 LANGUAGES C)

# -----------------------------------------------------------------------------
# Library
# -----------------------------------------------------------------------------
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Add POSIX feature test macro (2008 edition is common)
add_compile_definitions(_POSIX_C_SOURCE=200809L)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../facil.io ${CMAKE_CURRENT_BINARY_DIR}/facil.io)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_THREAD_PREFER_PTHREAD TRUE)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

file(GLOB SOURCES src/*.c)
file(GLOB HEADERS src/*.h)

add_library(facil-io-router ${SOURCES})
target_link_libraries(facil-io-router PUBLIC facil.io)

target_include_directories(facil-io-router
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

set_target_properties(facil-io-router PROPERTIES
    POSITION_INDEPENDENT_CODE ON
)

# -----------------------------------------------------------------------------
# Sample service for tests (optional)
# -----------------------------------------------------------------------------
option(BUILD_SAMPLE_SERVICE "Build sample service for tests" OFF)

if(BUILD_SAMPLE_SERVICE)
    file(GLOB SAMPLE_SOURCES src/*.c sample-service/src/*.c)

    add_executable(facil-io-router-sample-service ${SAMPLE_SOURCES})

    target_include_directories(facil-io-router-sample-service
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include/
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/sample-service/src
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/../facil.io/
    )

    target_link_libraries(facil-io-router-sample-service PRIVATE facil.io)

    add_compile_options(-fsanitize=address -fsanitize=thread)
    add_link_options(-fsanitize=address -fsanitize=thread)
endif()
