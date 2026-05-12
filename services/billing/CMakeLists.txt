cmake_minimum_required(VERSION 3.16)
project(billing-service)

#
# Common settings
#
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

file(GLOB_RECURSE SOURCES "src/*.cpp")

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../libraries/c/jetenv ${CMAKE_CURRENT_BINARY_DIR}/jetenv)

add_executable(billing ${SOURCES})
target_include_directories(billing PRIVATE include)
set_target_properties(billing PROPERTIES RUNTIME_OUTPUT_DIRECTORY
                                      "${CMAKE_BINARY_DIR}/bin")
target_include_directories(billing PRIVATE "${PROJECT_SOURCE_DIR}/src")
target_include_directories(billing PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/../../libraries/c/jetenv/include")
target_link_options(billing PRIVATE -no-pie)
target_link_libraries(billing PRIVATE jetenv)

#
# ASIO configuration (required by crow)
#
include(FetchContent)

FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2)
FetchContent_MakeAvailable(asio)
target_include_directories(billing PRIVATE ${asio_SOURCE_DIR}/asio/include)
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

target_include_directories(billing PRIVATE ${crow_SOURCE_DIR}/include)

#
# Poco configuration (Foundation + JSON + Data + DataPostgreSQL only)
#
set(ENABLE_XML                   OFF CACHE BOOL "" FORCE)
set(ENABLE_JSON                  ON  CACHE BOOL "" FORCE)  # Required by Poco::Data internals
set(ENABLE_UTIL                  OFF CACHE BOOL "" FORCE)
set(ENABLE_NET                   OFF CACHE BOOL "" FORCE)
set(ENABLE_NETSSL                OFF CACHE BOOL "" FORCE)
set(ENABLE_NETSSL_WIN            OFF CACHE BOOL "" FORCE)
set(ENABLE_CRYPTO                OFF CACHE BOOL "" FORCE)
set(ENABLE_JWT                   OFF CACHE BOOL "" FORCE)
set(ENABLE_DATA                  ON  CACHE BOOL "" FORCE)
set(ENABLE_DATAPOSTGRESQL        ON  CACHE BOOL "" FORCE)
set(ENABLE_DATASQLITE            OFF CACHE BOOL "" FORCE)
set(ENABLE_DATAMYSQL             OFF CACHE BOOL "" FORCE)
set(ENABLE_DATAODBC              OFF CACHE BOOL "" FORCE)
set(ENABLE_MONGODB               OFF CACHE BOOL "" FORCE)
set(ENABLE_REDIS                 OFF CACHE BOOL "" FORCE)
set(ENABLE_PROMETHEUS            OFF CACHE BOOL "" FORCE)
set(ENABLE_ZIP                   OFF CACHE BOOL "" FORCE)
set(ENABLE_APACHECONNECTOR       OFF CACHE BOOL "" FORCE)
set(ENABLE_CPPPARSER             OFF CACHE BOOL "" FORCE)
set(ENABLE_POCODOC               OFF CACHE BOOL "" FORCE)
set(ENABLE_PAGECOMPILER          OFF CACHE BOOL "" FORCE)
set(ENABLE_PAGECOMPILER_FILE2PAGE OFF CACHE BOOL "" FORCE)
set(ENABLE_ACTIVERECORD          OFF CACHE BOOL "" FORCE)
set(ENABLE_ACTIVERECORD_COMPILER OFF CACHE BOOL "" FORCE)
set(ENABLE_ENCODINGS             OFF CACHE BOOL "" FORCE)
set(ENABLE_SEVENZIP              OFF CACHE BOOL "" FORCE)
set(BUILD_TESTS                  OFF CACHE BOOL "" FORCE)
set(BUILD_SAMPLES                OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
  poco
  GIT_REPOSITORY https://github.com/pocoproject/poco.git
  GIT_TAG        poco-1.15.1-release)
FetchContent_MakeAvailable(poco)

target_link_libraries(billing PRIVATE
    Poco::Foundation
    Poco::JSON
    Poco::Data
    Poco::DataPostgreSQL)
