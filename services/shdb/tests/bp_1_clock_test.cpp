#include <gtest/gtest.h>

#include <cassert>
#include <chrono>
#include <iostream>
#include <sstream>

#include "bufferpool.h"
#include "cache.h"
#include "db.h"

namespace {

auto fixed_schema = std::make_shared<shdb::Schema>(
    shdb::Schema{{"id", shdb::Type::kUint64},
                 {"name", shdb::Type::kVarchar, 1024},
                 {"age", shdb::Type::kUint64},
                 {"graduated", shdb::Type::kBoolean}});

std::shared_ptr<shdb::Database> CreateDatabase(int frame_count) {
  auto db = shdb::Connect("./mydb", frame_count);
  if (db->CheckTableExists("test_table")) {
    db->DropTable("test_table");
  }
  db->CreateTable("test_table", fixed_schema);
  return db;
}

}  // namespace

TEST(ClockCache, Simple) {
  const int frame_count = 5;
  auto frames = std::vector<int>(frame_count);
  for (int i = 0; i < frame_count; ++i) {
    frames[i] = i;
  }
  auto cache = shdb::ClockCache<int, int>(frames);

  for (int i = 0; i < 100; ++i) {
    ASSERT_FALSE(cache.Find(i).first);
  }

  for (int i = 0; i < 100; ++i) {
    auto value = cache.Put(i);
    ASSERT_LE(0, value);
    ASSERT_LT(value, frame_count);
  }
}

TEST(ClockCache, LockSimple) {
  const int frame_count = 5;
  auto frames = std::vector<int>(frame_count);
  for (int i = 0; i < frame_count; ++i) {
    frames[i] = i;
  }
  auto cache = shdb::ClockCache<int, int>(frames);

  for (int i = 0; i < frame_count; ++i) {
    cache.Put(i);
    cache.Lock(i);
  }

  for (int i = 0; i + 1 < frame_count; ++i) {
    auto [first_found, first_value] = cache.Find(i);
    ASSERT_TRUE(first_found);
    auto [second_found, second_value] = cache.Find(i);
    ASSERT_TRUE(second_found);
    ASSERT_EQ(first_value, second_value);
  }

  cache.Unlock(0);
  auto free_value = cache.Put(100);

  for (int i = 101; i < 1000; ++i) {
    ASSERT_EQ(cache.Put(i), free_value);
    ASSERT_FALSE(cache.Find(100).first);
  }
}

TEST(ClockCache, LockMany) {
  const int frame_count = 5;
  auto frames = std::vector<int>(frame_count);
  for (int i = 0; i < frame_count; ++i) {
    frames[i] = i;
  }
  auto cache = shdb::ClockCache<int, int>(frames);

  for (int i = 0; i < frame_count; ++i) {
    cache.Put(i);
    cache.Lock(i);
  }

  EXPECT_ANY_THROW(cache.Put(100));
}

TEST(BufferPool, Clock) {
  shdb::PageIndex pool_size = 5;
  auto db = CreateDatabase(pool_size);
  auto table = db->GetTable("test_table", fixed_schema);

  std::vector<std::pair<shdb::RowId, shdb::Row>> rows;
  shdb::PageIndex page_count = 0;
  uint64_t row_count = 0;

  while (page_count < pool_size + 1) {
    std::stringstream stream;
    stream << "clone" << row_count;
    auto row = shdb::Row{row_count, stream.str(), 20UL + row_count % 10,
                         row_count % 10 > 5};
    auto row_id = table->InsertRow(row);
    rows.emplace_back(row_id, std::move(row));
    page_count = std::max(page_count, row_id.page_index + 1);
    ++row_count;
  }

  auto statistics = db->GetStatistics();
  int rounds = 100;
  auto run = [&](auto filter) {
    auto start_page_read = statistics->page_read;
    auto start = std::chrono::steady_clock::now();
    for (int round = 0; round < rounds; ++round) {
      for (auto& [row_id, row] : rows) {
        if (filter(row_id.page_index)) {
          auto found_row = table->GetRow(row_id);
          assert(found_row == row);
        }
      }
    }
    auto end = std::chrono::steady_clock::now();
    auto elapsed =
        std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    auto page_read = statistics->page_read - start_page_read;
    std::cout << "required " << page_read << " page fetches and finished in "
              << elapsed.count() << "ms" << std::endl;
    return page_read;
  };

  std::cout << "Lookups with working set fit into cache... ";
  auto page_read = run([&](auto page_index) { return page_index < pool_size; });
  ASSERT_LE(page_read, static_cast<uint64_t>(pool_size));

  std::cout << "Lookups with working set fit into cache... ";
  page_read = run([&](auto page_index) { return page_index > 1; });
  ASSERT_LE(page_read, static_cast<uint64_t>(pool_size));

  std::cout << "Lookups with working set unfit into cache... ";
  page_read = run([&](auto) { return true; });
  ASSERT_GE(page_read, static_cast<uint64_t>(pool_size));

  std::cout << "Test bufferpool passed" << std::endl;
}
