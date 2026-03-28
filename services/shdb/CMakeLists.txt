cmake_minimum_required(VERSION 3.16)
project(MyProject)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE SOURCES "src/*.cpp")

add_executable(shdb ${SOURCES})
target_include_directories(shdb PRIVATE include)

if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64|AMD64")
    set(SHDB_CORE_BLOB "${CMAKE_SOURCE_DIR}/blob/libshdb_core_x86_64_linux_glibc.a")
else()
    message(FATAL_ERROR "Not shdb blob for arch.")
endif()

target_link_libraries(shdb PRIVATE ${SHDB_CORE_BLOB})
set_target_properties(shdb PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
