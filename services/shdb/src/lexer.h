#include "parser.hpp"

namespace shdb {

class Lexer {
 public:
  Lexer(const char* p, const char* pe);

  Parser::token_type lex(Parser::semantic_type* val);  // NOLINT

 private:
  const char *p, *pe, *eof, *ts, *te;  // NOLINT
  int cs, act;                         // NOLINT
};

}  // namespace shdb
