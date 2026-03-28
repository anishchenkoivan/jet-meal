#include <iostream>
#include <string>

#include "db.h"
#include "row.h"
#include "interpreter.h"

static void PrintUsage(const char* argv0) {
    std::cerr << "Usage: " << argv0 << " --db <path> --frames <count>\n";
}

int main(int argc, char* argv[]) {
    std::string db_path;
    int frame_count = 0;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--db" && i + 1 < argc) {
            db_path = argv[++i];
        } else if (arg == "--frames" && i + 1 < argc) {
            frame_count = std::stoi(argv[++i]);
        } else {
            PrintUsage(argv[0]);
            return 1;
        }
    }

    if (db_path.empty() || frame_count <= 0) {
        PrintUsage(argv[0]);
        return 1;
    }

    auto db = shdb::Connect(db_path, frame_count);
    shdb::Interpreter interpreter(db);

    std::string line;
    while (std::cout << "shdb> ", std::getline(std::cin, line)) {
        if (line.empty()) {
            continue;
        }
        try {
            auto rowset = interpreter.Execute(line);
            const auto& schema = rowset.GetSchema();
            if (schema) {
                bool first = true;
                for (const auto& col : *schema) {
                    if (!first) std::cout << "\t";
                    std::cout << col.name;
                    first = false;
                }
                if (!schema->empty()) std::cout << "\n";
            }
            for (const auto& row : rowset.GetRows()) {
                std::cout << shdb::ToString(row) << "\n";
            }
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << "\n";
        }
    }

    std::cout << "\n";
    return 0;
}

