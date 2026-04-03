cmake_minimum_required(VERSION 3.16)
project(MyProject)

#
# Common settings
#
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

file(GLOB_RECURSE SOURCES "src/*.cpp")

add_executable(shdb ${SOURCES})
target_include_directories(shdb PRIVATE include)
set_target_properties(shdb PROPERTIES RUNTIME_OUTPUT_DIRECTORY
                                      "${CMAKE_BINARY_DIR}/bin")
target_include_directories(shdb PRIVATE "${PROJECT_SOURCE_DIR}/src")
target_link_options(shdb PRIVATE -no-pie)

#
# SHDB blob configuration
#
if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64|AMD64")
  set(SHDB_CORE_BLOB "${CMAKE_SOURCE_DIR}/blob/libshdb_core_x86_64.a")
else()
  message(FATAL_ERROR "Not shdb blob for arch.")
endif()

target_link_libraries(shdb PRIVATE ${SHDB_CORE_BLOB})

#
# ASIO configuration (required by crow)
#
include(FetchContent)

FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2)
FetchContent_MakeAvailable(asio)
target_include_directories(shdb PRIVATE ${asio_SOURCE_DIR}/asio/include)
set(ASIO_INCLUDE_DIR
    ${asio_SOURCE_DIR}/asio/include
    CACHE PATH "Asio include directory" FORCE)

#
# Crow configuration
#
include(FetchContent)

FetchContent_Declare(
  crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.2.0)
FetchContent_MakeAvailable(crow)

target_include_directories(shdb PRIVATE ${crow_SOURCE_DIR}/include)
