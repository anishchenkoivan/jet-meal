cmake_minimum_required(VERSION 3.28)
project(businesses-service VERSION 1.0.0 LANGUAGES C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Add POSIX feature test macro (2008 edition is common)
add_compile_definitions(_POSIX_C_SOURCE=200809L)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../libraries/c/facil-io-router ${CMAKE_CURRENT_BINARY_DIR}/facil-io-router)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../libraries/c/jetenv ${CMAKE_CURRENT_BINARY_DIR}/jetenv)
find_package(PostgreSQL REQUIRED)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

option(BUILD_SHARED_LIBS "Build shared libraries" OFF)
option(ENABLE_SANITIZER "Enable AddressSanitizer + UndefinedBehaviorSanitizer" OFF)

file(GLOB SOURCES src/*.c)
file(GLOB HEADERS src/*.h)

add_executable(businesses-service ${SOURCES})
target_link_libraries(businesses-service PRIVATE facil.io)
target_link_libraries(businesses-service PRIVATE facil-io-router)
target_link_libraries(businesses-service PRIVATE jetenv)
target_link_libraries(businesses-service PRIVATE PostgreSQL::PostgreSQL)

target_include_directories(businesses-service
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/src/
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/../../libraries/c/jetenv/include
)

if(ENABLE_SANITIZER)
    if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
        target_compile_options(businesses-service PRIVATE -fsanitize=address,undefined -g -O1)
        target_link_options(businesses-service PRIVATE -fsanitize=address,undefined)
        message(STATUS "Sanitizer enabled (ASan + UBSan)")
    else()
        message(WARNING "Sanitizer not supported with compiler ${CMAKE_C_COMPILER_ID}")
    endif()
endif()
