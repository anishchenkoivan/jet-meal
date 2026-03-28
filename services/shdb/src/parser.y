%skeleton "lalr1.cc"
%require "2.5"
%defines
%define api.namespace {shdb}
%define api.value.type variant
%define api.parser.class {Parser}
%define parse.error detailed

%code requires {
    #include <memory>
    #include "ast.h"
    #include "schema.h"
    namespace shdb {class Lexer;}
}

%parse-param {shdb::Lexer& lexer} {ASTPtr & result} {std::string & message}

%code {
    #include "lexer.h"
    #define yylex lexer.lex
}

%token END 0 "end of file"
%token ERROR
%token DROP "DROP"
%token CREATE "CREATE"
%token SELECT "SELECT"
%token INSERT "INSERT"
%token TABLE "TABLE"
%token VALUES "VALUES"
%token FROM "FROM"
%token WHERE "WHERE"
%token ORDER_BY "ORDER BY"
%token DESC "DESC"

%token LPAR "("
%token RPAR ")"
%token COMMA ","

%token PLUS "+"
%token MINUS "-"
%token MUL "*"
%token DIV "/"

%token EQ "=="
%token NEQ "!="
%token LE "<="
%token GE ">="
%token LT "<"
%token GT ">"

%token NOT "not"
%token OR "or"
%token AND "and"

%token BOOLEAN "boolean"
%token UINT64 "uint64"
%token INT64 "int64"
%token STRING "string"
%token VARCHAR "varchar"

%token <int> NUM
%token <std::string> NAME
%token <std::string> STRING_LITERAL

%type <Schema> schema
%type <ColumnSchema> column_schema
%type <Type> type
%type <ASTPtr> expr
%type <std::shared_ptr<ASTOrder>> sort_expr
%type <ASTListPtr> expr_list
%type <ASTListPtr> sort_expr_list
%type <ASTListPtr> projection
%type <std::vector<std::string>> names_list

%left "or"
%left "and"
%nonassoc "not"
%left "==" "!=" "<" "<=" ">" ">="
%left "="
%left ","
%left "+" "-"
%left "*" "/"
%nonassoc UMINUS
%nonassoc UNOT
%nonassoc ELSE
%nonassoc THEN

%%

input: END {  }
     | DROP TABLE NAME { result = std::make_shared<ASTDropQuery>($3); }
     | CREATE TABLE NAME "(" schema ")" { result = std::make_shared<ASTCreateQuery>($3, $5); }
     | SELECT projection { result = std::make_shared<ASTSelectQuery>($2); }
     | SELECT projection FROM names_list { result = std::make_shared<ASTSelectQuery>($2, $4); }
     | SELECT projection FROM names_list WHERE expr { result = std::make_shared<ASTSelectQuery>($2, $4, $6); }
     | SELECT projection FROM names_list ORDER_BY sort_expr_list { result = std::make_shared<ASTSelectQuery>($2, $4, nullptr, nullptr, nullptr, $6); }
     | SELECT projection FROM names_list WHERE expr ORDER_BY sort_expr_list { result = std::make_shared<ASTSelectQuery>($2, $4, $6, nullptr, nullptr, $8); }
     | INSERT NAME VALUES "(" expr_list ")" { result = std::make_shared<ASTInsertQuery>($2, $5); }
;

schema: column_schema { $$ = {$1}; }
      | schema "," column_schema { $1.push_back($3); $$ = $1; }

column_schema: NAME type { $$ = ColumnSchema($1, $2); }
             | NAME VARCHAR "(" NUM ")" { $$ = ColumnSchema($1, Type::kVarchar, $4); }

type: BOOLEAN { $$ = Type::kBoolean; }
    | UINT64 { $$ = Type::kUint64; }
    | INT64 { $$ = Type::kInt64; }
    | STRING { $$ = Type::kString; }

projection: expr_list { $$ = $1; }
          | "*" { $$ = nullptr; }

names_list: NAME { $$ = { $1 }; }
          | names_list "," NAME { $1.push_back($3); $$ = $1; }

expr_list : expr { $$ = std::make_shared<ASTList>($1); }
          | expr_list "," expr { $1->Append($3); $$ = $1; }

sort_expr_list : sort_expr { $$ = std::make_shared<ASTList>($1); }
               | sort_expr_list "," sort_expr { $1->Append($3); $$ = $1; }

sort_expr : expr { $$ = std::make_shared<ASTOrder>($1, false); }
          | expr DESC { $$ = std::make_shared<ASTOrder>($1, true); }

expr: NUM { $$ = std::make_shared<ASTLiteral>($1); }
    | STRING_LITERAL { $$ = std::make_shared<ASTLiteral>($1); }
    | NAME { $$ = std::make_shared<ASTIdentifier>($1); }
    | expr "+" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kPlus, $1, $3); }
    | expr "-" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kMinus, $1, $3); }
    | expr "*" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kMul, $1, $3); }
    | expr "/" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kDiv, $1, $3); }
    | "(" expr ")" { $$ = $2; }
    | "-" %prec UMINUS expr { $$ = std::make_shared<ASTUnaryOperator>(UnaryOperatorCode::kUMinus, $2); }
    | expr "==" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kEq, $1, $3); }
    | expr "!=" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kNe, $1, $3); }
    | expr "<" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLt, $1, $3); }
    | expr ">" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kGt, $1, $3); }
    | expr "<=" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLe, $1, $3); }
    | expr ">=" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kGe, $1, $3); }
    | "not" %prec UNOT expr { $$ = std::make_shared<ASTUnaryOperator>(UnaryOperatorCode::kLNot, $2); }
    | expr "or" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLOr, $1, $3); }
    | expr "and" expr { $$ = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLAnd, $1, $3); }

%%

void shdb::Parser::error(const std::string& err)
{
	message = err;
}
