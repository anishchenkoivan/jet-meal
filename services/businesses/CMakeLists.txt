cmake_minimum_required(VERSION 3.28)
project(businesses-service VERSION 1.0.0 LANGUAGES C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Add POSIX feature test macro (2008 edition is common)
add_compile_definitions(_POSIX_C_SOURCE=200809L)

add_subdirectory(contrib/facil.io)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

file(GLOB SOURCES src/*.c)
file(GLOB HEADERS src/*.h)

add_executable(businesses-service ${SOURCES})
target_link_libraries(businesses-service PRIVATE facil.io)
