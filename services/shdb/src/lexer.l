#include "lexer.h"

namespace shdb {

%%{
    machine lexer;
    main := |*
        digit+ => {
            ret = Parser::token::NUM;
            Parser::semantic_type num(strtol(std::string(ts, te).c_str(), 0, 10));
            val->move<int>(num);
            fbreak;
        };

        'DROP' => { ret = Parser::token::DROP; fbreak; };
        'CREATE' => { ret = Parser::token::CREATE; fbreak; };
        'SELECT' => { ret = Parser::token::SELECT; fbreak; };
        'INSERT' => { ret = Parser::token::INSERT; fbreak; };
        'TABLE' => { ret = Parser::token::TABLE; fbreak; };
        'VALUES' => { ret = Parser::token::VALUES; fbreak; };
        'WHERE' => { ret = Parser::token::WHERE; fbreak; };
        'FROM' => { ret = Parser::token::FROM; fbreak; };
        'ORDER BY' => { ret = Parser::token::ORDER_BY; fbreak; };
        'DESC' => { ret = Parser::token::DESC; fbreak; };

        'boolean' => { ret = Parser::token::BOOLEAN; fbreak; };
        'uint64' => { ret = Parser::token::UINT64; fbreak; };
        'int64' => { ret = Parser::token::INT64; fbreak; };
        'string' => { ret = Parser::token::STRING; fbreak; };
        'varchar' => { ret = Parser::token::VARCHAR; fbreak; };

        '(' => { ret = Parser::token::LPAR; fbreak; };
        ')' => { ret = Parser::token::RPAR; fbreak; };
        ',' => { ret = Parser::token::COMMA; fbreak; };

        '+' => { ret = Parser::token::PLUS; fbreak; };
        '-' => { ret = Parser::token::MINUS; fbreak; };
        '*' => { ret = Parser::token::MUL; fbreak; };
        '/' => { ret = Parser::token::DIV; fbreak; };

        "==" => { ret = Parser::token::EQ; fbreak; };
        "!=" => { ret = Parser::token::NEQ; fbreak; };
        "<=" => { ret = Parser::token::LE; fbreak; };
        ">=" => { ret = Parser::token::GE; fbreak; };
        "<"  => { ret = Parser::token::LT; fbreak; };
        ">"  => { ret = Parser::token::GT; fbreak; };
        
        "not" => { ret = Parser::token::NOT; fbreak; };
        "or"  => { ret = Parser::token::OR; fbreak; };
        "and"  => { ret = Parser::token::AND; fbreak; };
    
        "\"" alpha.alnum* "\"" => {
            ret = Parser::token::STRING_LITERAL;
            Parser::semantic_type str(std::string(ts + 1, te - 1));
            val->move<std::string>(str);
            fbreak;
        };

        alpha (alnum | '_')* => {
          ret = Parser::token::NAME;
          Parser::semantic_type str(std::string(ts, te));
          val->move<std::string>(str);
          fbreak;
        };

        space;
    *|;
    write data;
}%%


Lexer::Lexer(const char *p, const char *pe)
    : p(p), pe(pe), eof(pe)
{
    %%write init;
}

Parser::token_type Lexer::lex(Parser::semantic_type* val)
{
    Parser::token_type ret = Parser::token::END;
    %%write exec;

    if (ret == Parser::token::END && p != pe && te != pe) {
        std::cerr << "Unexpected input: \"" << std::string(te, pe) << "\"" << std::endl;
        ret = Parser::token::ERROR;
    }

    return ret;
}

}
