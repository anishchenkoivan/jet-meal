// A Bison parser, made by GNU Bison 3.8.2.

// Skeleton implementation for Bison LALR(1) parsers in C++

// Copyright (C) 2002-2015, 2018-2021 Free Software Foundation, Inc.

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// As a special exception, you may create a larger work that contains
// part or all of the Bison parser skeleton and distribute that work
// under terms of your choice, so long as that work isn't itself a
// parser generator using the skeleton or a modified version thereof
// as a parser skeleton.  Alternatively, if you modify or redistribute
// the parser skeleton itself, you may (at your option) remove this
// special exception, which will cause the skeleton and the resulting
// Bison output files to be licensed under the GNU General Public
// License without this special exception.

// This special exception was added by the Free Software Foundation in
// version 2.2 of Bison.

// DO NOT RELY ON FEATURES THAT ARE NOT DOCUMENTED in the manual,
// especially those whose name start with YY_ or yy_.  They are
// private implementation details that can be changed or removed.





#include "parser.hpp"


// Unqualified %code blocks.
#line 18 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"

    #include "lexer.h"
    #define yylex lexer.lex

#line 51 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"


#ifndef YY_
# if defined YYENABLE_NLS && YYENABLE_NLS
#  if ENABLE_NLS
#   include <libintl.h> // FIXME: INFRINGES ON USER NAME SPACE.
#   define YY_(msgid) dgettext ("bison-runtime", msgid)
#  endif
# endif
# ifndef YY_
#  define YY_(msgid) msgid
# endif
#endif


// Whether we are compiled with exception support.
#ifndef YY_EXCEPTIONS
# if defined __GNUC__ && !defined __EXCEPTIONS
#  define YY_EXCEPTIONS 0
# else
#  define YY_EXCEPTIONS 1
# endif
#endif



// Enable debugging if requested.
#if YYDEBUG

// A pseudo ostream that takes yydebug_ into account.
# define YYCDEBUG if (yydebug_) (*yycdebug_)

# define YY_SYMBOL_PRINT(Title, Symbol)         \
  do {                                          \
    if (yydebug_)                               \
    {                                           \
      *yycdebug_ << Title << ' ';               \
      yy_print_ (*yycdebug_, Symbol);           \
      *yycdebug_ << '\n';                       \
    }                                           \
  } while (false)

# define YY_REDUCE_PRINT(Rule)          \
  do {                                  \
    if (yydebug_)                       \
      yy_reduce_print_ (Rule);          \
  } while (false)

# define YY_STACK_PRINT()               \
  do {                                  \
    if (yydebug_)                       \
      yy_stack_print_ ();                \
  } while (false)

#else // !YYDEBUG

# define YYCDEBUG if (false) std::cerr
# define YY_SYMBOL_PRINT(Title, Symbol)  YY_USE (Symbol)
# define YY_REDUCE_PRINT(Rule)           static_cast<void> (0)
# define YY_STACK_PRINT()                static_cast<void> (0)

#endif // !YYDEBUG

#define yyerrok         (yyerrstatus_ = 0)
#define yyclearin       (yyla.clear ())

#define YYACCEPT        goto yyacceptlab
#define YYABORT         goto yyabortlab
#define YYERROR         goto yyerrorlab
#define YYRECOVERING()  (!!yyerrstatus_)

#line 4 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
namespace shdb {
#line 125 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"

  /// Build a parser object.
  Parser::Parser (shdb::Lexer& lexer_yyarg, ASTPtr & result_yyarg, std::string & message_yyarg)
#if YYDEBUG
    : yydebug_ (false),
      yycdebug_ (&std::cerr),
#else
    :
#endif
      lexer (lexer_yyarg),
      result (result_yyarg),
      message (message_yyarg)
  {}

  Parser::~Parser ()
  {}

  Parser::syntax_error::~syntax_error () YY_NOEXCEPT YY_NOTHROW
  {}

  /*---------.
  | symbol.  |
  `---------*/

  // basic_symbol.
  template <typename Base>
  Parser::basic_symbol<Base>::basic_symbol (const basic_symbol& that)
    : Base (that)
    , value ()
  {
    switch (this->kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.copy< ASTListPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_expr: // expr
        value.copy< ASTPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.copy< ColumnSchema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_schema: // schema
        value.copy< Schema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_type: // type
        value.copy< Type > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NUM: // NUM
        value.copy< int > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.copy< std::shared_ptr<ASTOrder> > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.copy< std::string > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_names_list: // names_list
        value.copy< std::vector<std::string> > (YY_MOVE (that.value));
        break;

      default:
        break;
    }

  }




  template <typename Base>
  Parser::symbol_kind_type
  Parser::basic_symbol<Base>::type_get () const YY_NOEXCEPT
  {
    return this->kind ();
  }


  template <typename Base>
  bool
  Parser::basic_symbol<Base>::empty () const YY_NOEXCEPT
  {
    return this->kind () == symbol_kind::S_YYEMPTY;
  }

  template <typename Base>
  void
  Parser::basic_symbol<Base>::move (basic_symbol& s)
  {
    super_type::move (s);
    switch (this->kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.move< ASTListPtr > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_expr: // expr
        value.move< ASTPtr > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.move< ColumnSchema > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_schema: // schema
        value.move< Schema > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_type: // type
        value.move< Type > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_NUM: // NUM
        value.move< int > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.move< std::shared_ptr<ASTOrder> > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.move< std::string > (YY_MOVE (s.value));
        break;

      case symbol_kind::S_names_list: // names_list
        value.move< std::vector<std::string> > (YY_MOVE (s.value));
        break;

      default:
        break;
    }

  }

  // by_kind.
  Parser::by_kind::by_kind () YY_NOEXCEPT
    : kind_ (symbol_kind::S_YYEMPTY)
  {}

#if 201103L <= YY_CPLUSPLUS
  Parser::by_kind::by_kind (by_kind&& that) YY_NOEXCEPT
    : kind_ (that.kind_)
  {
    that.clear ();
  }
#endif

  Parser::by_kind::by_kind (const by_kind& that) YY_NOEXCEPT
    : kind_ (that.kind_)
  {}

  Parser::by_kind::by_kind (token_kind_type t) YY_NOEXCEPT
    : kind_ (yytranslate_ (t))
  {}



  void
  Parser::by_kind::clear () YY_NOEXCEPT
  {
    kind_ = symbol_kind::S_YYEMPTY;
  }

  void
  Parser::by_kind::move (by_kind& that)
  {
    kind_ = that.kind_;
    that.clear ();
  }

  Parser::symbol_kind_type
  Parser::by_kind::kind () const YY_NOEXCEPT
  {
    return kind_;
  }


  Parser::symbol_kind_type
  Parser::by_kind::type_get () const YY_NOEXCEPT
  {
    return this->kind ();
  }



  // by_state.
  Parser::by_state::by_state () YY_NOEXCEPT
    : state (empty_state)
  {}

  Parser::by_state::by_state (const by_state& that) YY_NOEXCEPT
    : state (that.state)
  {}

  void
  Parser::by_state::clear () YY_NOEXCEPT
  {
    state = empty_state;
  }

  void
  Parser::by_state::move (by_state& that)
  {
    state = that.state;
    that.clear ();
  }

  Parser::by_state::by_state (state_type s) YY_NOEXCEPT
    : state (s)
  {}

  Parser::symbol_kind_type
  Parser::by_state::kind () const YY_NOEXCEPT
  {
    if (state == empty_state)
      return symbol_kind::S_YYEMPTY;
    else
      return YY_CAST (symbol_kind_type, yystos_[+state]);
  }

  Parser::stack_symbol_type::stack_symbol_type ()
  {}

  Parser::stack_symbol_type::stack_symbol_type (YY_RVREF (stack_symbol_type) that)
    : super_type (YY_MOVE (that.state))
  {
    switch (that.kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.YY_MOVE_OR_COPY< ASTListPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_expr: // expr
        value.YY_MOVE_OR_COPY< ASTPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.YY_MOVE_OR_COPY< ColumnSchema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_schema: // schema
        value.YY_MOVE_OR_COPY< Schema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_type: // type
        value.YY_MOVE_OR_COPY< Type > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NUM: // NUM
        value.YY_MOVE_OR_COPY< int > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.YY_MOVE_OR_COPY< std::shared_ptr<ASTOrder> > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.YY_MOVE_OR_COPY< std::string > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_names_list: // names_list
        value.YY_MOVE_OR_COPY< std::vector<std::string> > (YY_MOVE (that.value));
        break;

      default:
        break;
    }

#if 201103L <= YY_CPLUSPLUS
    // that is emptied.
    that.state = empty_state;
#endif
  }

  Parser::stack_symbol_type::stack_symbol_type (state_type s, YY_MOVE_REF (symbol_type) that)
    : super_type (s)
  {
    switch (that.kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.move< ASTListPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_expr: // expr
        value.move< ASTPtr > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.move< ColumnSchema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_schema: // schema
        value.move< Schema > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_type: // type
        value.move< Type > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NUM: // NUM
        value.move< int > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.move< std::shared_ptr<ASTOrder> > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.move< std::string > (YY_MOVE (that.value));
        break;

      case symbol_kind::S_names_list: // names_list
        value.move< std::vector<std::string> > (YY_MOVE (that.value));
        break;

      default:
        break;
    }

    // that is emptied.
    that.kind_ = symbol_kind::S_YYEMPTY;
  }

#if YY_CPLUSPLUS < 201103L
  Parser::stack_symbol_type&
  Parser::stack_symbol_type::operator= (const stack_symbol_type& that)
  {
    state = that.state;
    switch (that.kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.copy< ASTListPtr > (that.value);
        break;

      case symbol_kind::S_expr: // expr
        value.copy< ASTPtr > (that.value);
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.copy< ColumnSchema > (that.value);
        break;

      case symbol_kind::S_schema: // schema
        value.copy< Schema > (that.value);
        break;

      case symbol_kind::S_type: // type
        value.copy< Type > (that.value);
        break;

      case symbol_kind::S_NUM: // NUM
        value.copy< int > (that.value);
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.copy< std::shared_ptr<ASTOrder> > (that.value);
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.copy< std::string > (that.value);
        break;

      case symbol_kind::S_names_list: // names_list
        value.copy< std::vector<std::string> > (that.value);
        break;

      default:
        break;
    }

    return *this;
  }

  Parser::stack_symbol_type&
  Parser::stack_symbol_type::operator= (stack_symbol_type& that)
  {
    state = that.state;
    switch (that.kind ())
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        value.move< ASTListPtr > (that.value);
        break;

      case symbol_kind::S_expr: // expr
        value.move< ASTPtr > (that.value);
        break;

      case symbol_kind::S_column_schema: // column_schema
        value.move< ColumnSchema > (that.value);
        break;

      case symbol_kind::S_schema: // schema
        value.move< Schema > (that.value);
        break;

      case symbol_kind::S_type: // type
        value.move< Type > (that.value);
        break;

      case symbol_kind::S_NUM: // NUM
        value.move< int > (that.value);
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        value.move< std::shared_ptr<ASTOrder> > (that.value);
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        value.move< std::string > (that.value);
        break;

      case symbol_kind::S_names_list: // names_list
        value.move< std::vector<std::string> > (that.value);
        break;

      default:
        break;
    }

    // that is emptied.
    that.state = empty_state;
    return *this;
  }
#endif

  template <typename Base>
  void
  Parser::yy_destroy_ (const char* yymsg, basic_symbol<Base>& yysym) const
  {
    if (yymsg)
      YY_SYMBOL_PRINT (yymsg, yysym);
  }

#if YYDEBUG
  template <typename Base>
  void
  Parser::yy_print_ (std::ostream& yyo, const basic_symbol<Base>& yysym) const
  {
    std::ostream& yyoutput = yyo;
    YY_USE (yyoutput);
    if (yysym.empty ())
      yyo << "empty symbol";
    else
      {
        symbol_kind_type yykind = yysym.kind ();
        yyo << (yykind < YYNTOKENS ? "token" : "nterm")
            << ' ' << yysym.name () << " (";
        YY_USE (yykind);
        yyo << ')';
      }
  }
#endif

  void
  Parser::yypush_ (const char* m, YY_MOVE_REF (stack_symbol_type) sym)
  {
    if (m)
      YY_SYMBOL_PRINT (m, sym);
    yystack_.push (YY_MOVE (sym));
  }

  void
  Parser::yypush_ (const char* m, state_type s, YY_MOVE_REF (symbol_type) sym)
  {
#if 201103L <= YY_CPLUSPLUS
    yypush_ (m, stack_symbol_type (s, std::move (sym)));
#else
    stack_symbol_type ss (s, sym);
    yypush_ (m, ss);
#endif
  }

  void
  Parser::yypop_ (int n) YY_NOEXCEPT
  {
    yystack_.pop (n);
  }

#if YYDEBUG
  std::ostream&
  Parser::debug_stream () const
  {
    return *yycdebug_;
  }

  void
  Parser::set_debug_stream (std::ostream& o)
  {
    yycdebug_ = &o;
  }


  Parser::debug_level_type
  Parser::debug_level () const
  {
    return yydebug_;
  }

  void
  Parser::set_debug_level (debug_level_type l)
  {
    yydebug_ = l;
  }
#endif // YYDEBUG

  Parser::state_type
  Parser::yy_lr_goto_state_ (state_type yystate, int yysym)
  {
    int yyr = yypgoto_[yysym - YYNTOKENS] + yystate;
    if (0 <= yyr && yyr <= yylast_ && yycheck_[yyr] == yystate)
      return yytable_[yyr];
    else
      return yydefgoto_[yysym - YYNTOKENS];
  }

  bool
  Parser::yy_pact_value_is_default_ (int yyvalue) YY_NOEXCEPT
  {
    return yyvalue == yypact_ninf_;
  }

  bool
  Parser::yy_table_value_is_error_ (int yyvalue) YY_NOEXCEPT
  {
    return yyvalue == yytable_ninf_;
  }

  int
  Parser::operator() ()
  {
    return parse ();
  }

  int
  Parser::parse ()
  {
    int yyn;
    /// Length of the RHS of the rule being reduced.
    int yylen = 0;

    // Error handling.
    int yynerrs_ = 0;
    int yyerrstatus_ = 0;

    /// The lookahead symbol.
    symbol_type yyla;

    /// The return value of parse ().
    int yyresult;

#if YY_EXCEPTIONS
    try
#endif // YY_EXCEPTIONS
      {
    YYCDEBUG << "Starting parse\n";


    /* Initialize the stack.  The initial state will be set in
       yynewstate, since the latter expects the semantical and the
       location values to have been already stored, initialize these
       stacks with a primary value.  */
    yystack_.clear ();
    yypush_ (YY_NULLPTR, 0, YY_MOVE (yyla));

  /*-----------------------------------------------.
  | yynewstate -- push a new symbol on the stack.  |
  `-----------------------------------------------*/
  yynewstate:
    YYCDEBUG << "Entering state " << int (yystack_[0].state) << '\n';
    YY_STACK_PRINT ();

    // Accept?
    if (yystack_[0].state == yyfinal_)
      YYACCEPT;

    goto yybackup;


  /*-----------.
  | yybackup.  |
  `-----------*/
  yybackup:
    // Try to take a decision without lookahead.
    yyn = yypact_[+yystack_[0].state];
    if (yy_pact_value_is_default_ (yyn))
      goto yydefault;

    // Read a lookahead token.
    if (yyla.empty ())
      {
        YYCDEBUG << "Reading a token\n";
#if YY_EXCEPTIONS
        try
#endif // YY_EXCEPTIONS
          {
            yyla.kind_ = yytranslate_ (yylex (&yyla.value));
          }
#if YY_EXCEPTIONS
        catch (const syntax_error& yyexc)
          {
            YYCDEBUG << "Caught exception: " << yyexc.what() << '\n';
            error (yyexc);
            goto yyerrlab1;
          }
#endif // YY_EXCEPTIONS
      }
    YY_SYMBOL_PRINT ("Next token is", yyla);

    if (yyla.kind () == symbol_kind::S_YYerror)
    {
      // The scanner already issued an error message, process directly
      // to error recovery.  But do not keep the error token as
      // lookahead, it is too special and may lead us to an endless
      // loop in error recovery. */
      yyla.kind_ = symbol_kind::S_YYUNDEF;
      goto yyerrlab1;
    }

    /* If the proper action on seeing token YYLA.TYPE is to reduce or
       to detect an error, take that action.  */
    yyn += yyla.kind ();
    if (yyn < 0 || yylast_ < yyn || yycheck_[yyn] != yyla.kind ())
      {
        goto yydefault;
      }

    // Reduce or error.
    yyn = yytable_[yyn];
    if (yyn <= 0)
      {
        if (yy_table_value_is_error_ (yyn))
          goto yyerrlab;
        yyn = -yyn;
        goto yyreduce;
      }

    // Count tokens shifted since error; after three, turn off error status.
    if (yyerrstatus_)
      --yyerrstatus_;

    // Shift the lookahead token.
    yypush_ ("Shifting", state_type (yyn), YY_MOVE (yyla));
    goto yynewstate;


  /*-----------------------------------------------------------.
  | yydefault -- do the default action for the current state.  |
  `-----------------------------------------------------------*/
  yydefault:
    yyn = yydefact_[+yystack_[0].state];
    if (yyn == 0)
      goto yyerrlab;
    goto yyreduce;


  /*-----------------------------.
  | yyreduce -- do a reduction.  |
  `-----------------------------*/
  yyreduce:
    yylen = yyr2_[yyn];
    {
      stack_symbol_type yylhs;
      yylhs.state = yy_lr_goto_state_ (yystack_[yylen].state, yyr1_[yyn]);
      /* Variants are always initialized to an empty instance of the
         correct type. The default '$$ = $1' action is NOT applied
         when using variants.  */
      switch (yyr1_[yyn])
    {
      case symbol_kind::S_projection: // projection
      case symbol_kind::S_expr_list: // expr_list
      case symbol_kind::S_sort_expr_list: // sort_expr_list
        yylhs.value.emplace< ASTListPtr > ();
        break;

      case symbol_kind::S_expr: // expr
        yylhs.value.emplace< ASTPtr > ();
        break;

      case symbol_kind::S_column_schema: // column_schema
        yylhs.value.emplace< ColumnSchema > ();
        break;

      case symbol_kind::S_schema: // schema
        yylhs.value.emplace< Schema > ();
        break;

      case symbol_kind::S_type: // type
        yylhs.value.emplace< Type > ();
        break;

      case symbol_kind::S_NUM: // NUM
        yylhs.value.emplace< int > ();
        break;

      case symbol_kind::S_sort_expr: // sort_expr
        yylhs.value.emplace< std::shared_ptr<ASTOrder> > ();
        break;

      case symbol_kind::S_NAME: // NAME
      case symbol_kind::S_STRING_LITERAL: // STRING_LITERAL
        yylhs.value.emplace< std::string > ();
        break;

      case symbol_kind::S_names_list: // names_list
        yylhs.value.emplace< std::vector<std::string> > ();
        break;

      default:
        break;
    }



      // Perform the reduction.
      YY_REDUCE_PRINT (yyn);
#if YY_EXCEPTIONS
      try
#endif // YY_EXCEPTIONS
        {
          switch (yyn)
            {
  case 2: // input: "end of file"
#line 91 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
           {  }
#line 875 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 3: // input: "DROP" "TABLE" NAME
#line 92 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                       { result = std::make_shared<ASTDropQuery>(yystack_[0].value.as < std::string > ()); }
#line 881 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 4: // input: "CREATE" "TABLE" NAME "(" schema ")"
#line 93 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                        { result = std::make_shared<ASTCreateQuery>(yystack_[3].value.as < std::string > (), yystack_[1].value.as < Schema > ()); }
#line 887 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 5: // input: "SELECT" projection
#line 94 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                         { result = std::make_shared<ASTSelectQuery>(yystack_[0].value.as < ASTListPtr > ()); }
#line 893 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 6: // input: "SELECT" projection "FROM" names_list
#line 95 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                         { result = std::make_shared<ASTSelectQuery>(yystack_[2].value.as < ASTListPtr > (), yystack_[0].value.as < std::vector<std::string> > ()); }
#line 899 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 7: // input: "SELECT" projection "FROM" names_list "WHERE" expr
#line 96 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                                    { result = std::make_shared<ASTSelectQuery>(yystack_[4].value.as < ASTListPtr > (), yystack_[2].value.as < std::vector<std::string> > (), yystack_[0].value.as < ASTPtr > ()); }
#line 905 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 8: // input: "SELECT" projection "FROM" names_list "ORDER BY" sort_expr_list
#line 97 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                                                 { result = std::make_shared<ASTSelectQuery>(yystack_[4].value.as < ASTListPtr > (), yystack_[2].value.as < std::vector<std::string> > (), nullptr, nullptr, nullptr, yystack_[0].value.as < ASTListPtr > ()); }
#line 911 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 9: // input: "SELECT" projection "FROM" names_list "WHERE" expr "ORDER BY" sort_expr_list
#line 98 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                                                            { result = std::make_shared<ASTSelectQuery>(yystack_[6].value.as < ASTListPtr > (), yystack_[4].value.as < std::vector<std::string> > (), yystack_[2].value.as < ASTPtr > (), nullptr, nullptr, yystack_[0].value.as < ASTListPtr > ()); }
#line 917 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 10: // input: "INSERT" NAME "VALUES" "(" expr_list ")"
#line 99 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                            { result = std::make_shared<ASTInsertQuery>(yystack_[4].value.as < std::string > (), yystack_[1].value.as < ASTListPtr > ()); }
#line 923 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 11: // schema: column_schema
#line 102 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                      { yylhs.value.as < Schema > () = {yystack_[0].value.as < ColumnSchema > ()}; }
#line 929 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 12: // schema: schema "," column_schema
#line 103 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                 { yystack_[2].value.as < Schema > ().push_back(yystack_[0].value.as < ColumnSchema > ()); yylhs.value.as < Schema > () = yystack_[2].value.as < Schema > (); }
#line 935 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 13: // column_schema: NAME type
#line 105 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                         { yylhs.value.as < ColumnSchema > () = ColumnSchema(yystack_[1].value.as < std::string > (), yystack_[0].value.as < Type > ()); }
#line 941 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 14: // column_schema: NAME "varchar" "(" NUM ")"
#line 106 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                        { yylhs.value.as < ColumnSchema > () = ColumnSchema(yystack_[4].value.as < std::string > (), Type::kVarchar, yystack_[1].value.as < int > ()); }
#line 947 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 15: // type: "boolean"
#line 108 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
              { yylhs.value.as < Type > () = Type::kBoolean; }
#line 953 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 16: // type: "uint64"
#line 109 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
             { yylhs.value.as < Type > () = Type::kUint64; }
#line 959 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 17: // type: "int64"
#line 110 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
            { yylhs.value.as < Type > () = Type::kInt64; }
#line 965 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 18: // type: "string"
#line 111 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
             { yylhs.value.as < Type > () = Type::kString; }
#line 971 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 19: // projection: expr_list
#line 113 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                      { yylhs.value.as < ASTListPtr > () = yystack_[0].value.as < ASTListPtr > (); }
#line 977 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 20: // projection: "*"
#line 114 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                { yylhs.value.as < ASTListPtr > () = nullptr; }
#line 983 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 21: // names_list: NAME
#line 116 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                 { yylhs.value.as < std::vector<std::string> > () = { yystack_[0].value.as < std::string > () }; }
#line 989 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 22: // names_list: names_list "," NAME
#line 117 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                { yystack_[2].value.as < std::vector<std::string> > ().push_back(yystack_[0].value.as < std::string > ()); yylhs.value.as < std::vector<std::string> > () = yystack_[2].value.as < std::vector<std::string> > (); }
#line 995 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 23: // expr_list: expr
#line 119 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                 { yylhs.value.as < ASTListPtr > () = std::make_shared<ASTList>(yystack_[0].value.as < ASTPtr > ()); }
#line 1001 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 24: // expr_list: expr_list "," expr
#line 120 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                               { yystack_[2].value.as < ASTListPtr > ()->Append(yystack_[0].value.as < ASTPtr > ()); yylhs.value.as < ASTListPtr > () = yystack_[2].value.as < ASTListPtr > (); }
#line 1007 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 25: // sort_expr_list: sort_expr
#line 122 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                           { yylhs.value.as < ASTListPtr > () = std::make_shared<ASTList>(yystack_[0].value.as < std::shared_ptr<ASTOrder> > ()); }
#line 1013 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 26: // sort_expr_list: sort_expr_list "," sort_expr
#line 123 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                                              { yystack_[2].value.as < ASTListPtr > ()->Append(yystack_[0].value.as < std::shared_ptr<ASTOrder> > ()); yylhs.value.as < ASTListPtr > () = yystack_[2].value.as < ASTListPtr > (); }
#line 1019 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 27: // sort_expr: expr
#line 125 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                 { yylhs.value.as < std::shared_ptr<ASTOrder> > () = std::make_shared<ASTOrder>(yystack_[0].value.as < ASTPtr > (), false); }
#line 1025 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 28: // sort_expr: expr "DESC"
#line 126 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                      { yylhs.value.as < std::shared_ptr<ASTOrder> > () = std::make_shared<ASTOrder>(yystack_[1].value.as < ASTPtr > (), true); }
#line 1031 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 29: // expr: NUM
#line 128 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
          { yylhs.value.as < ASTPtr > () = std::make_shared<ASTLiteral>(yystack_[0].value.as < int > ()); }
#line 1037 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 30: // expr: STRING_LITERAL
#line 129 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTLiteral>(yystack_[0].value.as < std::string > ()); }
#line 1043 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 31: // expr: NAME
#line 130 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
           { yylhs.value.as < ASTPtr > () = std::make_shared<ASTIdentifier>(yystack_[0].value.as < std::string > ()); }
#line 1049 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 32: // expr: expr "+" expr
#line 131 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kPlus, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1055 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 33: // expr: expr "-" expr
#line 132 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kMinus, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1061 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 34: // expr: expr "*" expr
#line 133 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kMul, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1067 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 35: // expr: expr "/" expr
#line 134 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kDiv, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1073 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 36: // expr: "(" expr ")"
#line 135 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                   { yylhs.value.as < ASTPtr > () = yystack_[1].value.as < ASTPtr > (); }
#line 1079 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 37: // expr: "-" expr
#line 136 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                            { yylhs.value.as < ASTPtr > () = std::make_shared<ASTUnaryOperator>(UnaryOperatorCode::kUMinus, yystack_[0].value.as < ASTPtr > ()); }
#line 1085 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 38: // expr: expr "==" expr
#line 137 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kEq, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1091 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 39: // expr: expr "!=" expr
#line 138 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kNe, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1097 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 40: // expr: expr "<" expr
#line 139 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLt, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1103 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 41: // expr: expr ">" expr
#line 140 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                    { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kGt, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1109 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 42: // expr: expr "<=" expr
#line 141 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLe, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1115 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 43: // expr: expr ">=" expr
#line 142 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kGe, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1121 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 44: // expr: "not" expr
#line 143 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                            { yylhs.value.as < ASTPtr > () = std::make_shared<ASTUnaryOperator>(UnaryOperatorCode::kLNot, yystack_[0].value.as < ASTPtr > ()); }
#line 1127 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 45: // expr: expr "or" expr
#line 144 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                     { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLOr, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1133 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;

  case 46: // expr: expr "and" expr
#line 145 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
                      { yylhs.value.as < ASTPtr > () = std::make_shared<ASTBinaryOperator>(BinaryOperatorCode::kLAnd, yystack_[2].value.as < ASTPtr > (), yystack_[0].value.as < ASTPtr > ()); }
#line 1139 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"
    break;


#line 1143 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"

            default:
              break;
            }
        }
#if YY_EXCEPTIONS
      catch (const syntax_error& yyexc)
        {
          YYCDEBUG << "Caught exception: " << yyexc.what() << '\n';
          error (yyexc);
          YYERROR;
        }
#endif // YY_EXCEPTIONS
      YY_SYMBOL_PRINT ("-> $$ =", yylhs);
      yypop_ (yylen);
      yylen = 0;

      // Shift the result of the reduction.
      yypush_ (YY_NULLPTR, YY_MOVE (yylhs));
    }
    goto yynewstate;


  /*--------------------------------------.
  | yyerrlab -- here on detecting error.  |
  `--------------------------------------*/
  yyerrlab:
    // If not already recovering from an error, report this error.
    if (!yyerrstatus_)
      {
        ++yynerrs_;
        context yyctx (*this, yyla);
        std::string msg = yysyntax_error_ (yyctx);
        error (YY_MOVE (msg));
      }


    if (yyerrstatus_ == 3)
      {
        /* If just tried and failed to reuse lookahead token after an
           error, discard it.  */

        // Return failure if at end of input.
        if (yyla.kind () == symbol_kind::S_YYEOF)
          YYABORT;
        else if (!yyla.empty ())
          {
            yy_destroy_ ("Error: discarding", yyla);
            yyla.clear ();
          }
      }

    // Else will try to reuse lookahead token after shifting the error token.
    goto yyerrlab1;


  /*---------------------------------------------------.
  | yyerrorlab -- error raised explicitly by YYERROR.  |
  `---------------------------------------------------*/
  yyerrorlab:
    /* Pacify compilers when the user code never invokes YYERROR and
       the label yyerrorlab therefore never appears in user code.  */
    if (false)
      YYERROR;

    /* Do not reclaim the symbols of the rule whose action triggered
       this YYERROR.  */
    yypop_ (yylen);
    yylen = 0;
    YY_STACK_PRINT ();
    goto yyerrlab1;


  /*-------------------------------------------------------------.
  | yyerrlab1 -- common code for both syntax error and YYERROR.  |
  `-------------------------------------------------------------*/
  yyerrlab1:
    yyerrstatus_ = 3;   // Each real token shifted decrements this.
    // Pop stack until we find a state that shifts the error token.
    for (;;)
      {
        yyn = yypact_[+yystack_[0].state];
        if (!yy_pact_value_is_default_ (yyn))
          {
            yyn += symbol_kind::S_YYerror;
            if (0 <= yyn && yyn <= yylast_
                && yycheck_[yyn] == symbol_kind::S_YYerror)
              {
                yyn = yytable_[yyn];
                if (0 < yyn)
                  break;
              }
          }

        // Pop the current state because it cannot handle the error token.
        if (yystack_.size () == 1)
          YYABORT;

        yy_destroy_ ("Error: popping", yystack_[0]);
        yypop_ ();
        YY_STACK_PRINT ();
      }
    {
      stack_symbol_type error_token;


      // Shift the error token.
      error_token.state = state_type (yyn);
      yypush_ ("Shifting", YY_MOVE (error_token));
    }
    goto yynewstate;


  /*-------------------------------------.
  | yyacceptlab -- YYACCEPT comes here.  |
  `-------------------------------------*/
  yyacceptlab:
    yyresult = 0;
    goto yyreturn;


  /*-----------------------------------.
  | yyabortlab -- YYABORT comes here.  |
  `-----------------------------------*/
  yyabortlab:
    yyresult = 1;
    goto yyreturn;


  /*-----------------------------------------------------.
  | yyreturn -- parsing is finished, return the result.  |
  `-----------------------------------------------------*/
  yyreturn:
    if (!yyla.empty ())
      yy_destroy_ ("Cleanup: discarding lookahead", yyla);

    /* Do not reclaim the symbols of the rule whose action triggered
       this YYABORT or YYACCEPT.  */
    yypop_ (yylen);
    YY_STACK_PRINT ();
    while (1 < yystack_.size ())
      {
        yy_destroy_ ("Cleanup: popping", yystack_[0]);
        yypop_ ();
      }

    return yyresult;
  }
#if YY_EXCEPTIONS
    catch (...)
      {
        YYCDEBUG << "Exception caught: cleaning lookahead and stack\n";
        // Do not try to display the values of the reclaimed symbols,
        // as their printers might throw an exception.
        if (!yyla.empty ())
          yy_destroy_ (YY_NULLPTR, yyla);

        while (1 < yystack_.size ())
          {
            yy_destroy_ (YY_NULLPTR, yystack_[0]);
            yypop_ ();
          }
        throw;
      }
#endif // YY_EXCEPTIONS
  }

  void
  Parser::error (const syntax_error& yyexc)
  {
    error (yyexc.what ());
  }

  const char *
  Parser::symbol_name (symbol_kind_type yysymbol)
  {
    static const char *const yy_sname[] =
    {
    "end of file", "error", "invalid token", "ERROR", "DROP", "CREATE",
  "SELECT", "INSERT", "TABLE", "VALUES", "FROM", "WHERE", "ORDER BY",
  "DESC", "(", ")", ",", "+", "-", "*", "/", "==", "!=", "<=", ">=", "<",
  ">", "not", "or", "and", "boolean", "uint64", "int64", "string",
  "varchar", "NUM", "NAME", "STRING_LITERAL", "=", "UMINUS", "UNOT",
  "ELSE", "THEN", "$accept", "input", "schema", "column_schema", "type",
  "projection", "names_list", "expr_list", "sort_expr_list", "sort_expr",
  "expr", YY_NULLPTR
    };
    return yy_sname[yysymbol];
  }



  // Parser::context.
  Parser::context::context (const Parser& yyparser, const symbol_type& yyla)
    : yyparser_ (yyparser)
    , yyla_ (yyla)
  {}

  int
  Parser::context::expected_tokens (symbol_kind_type yyarg[], int yyargn) const
  {
    // Actual number of expected tokens
    int yycount = 0;

    const int yyn = yypact_[+yyparser_.yystack_[0].state];
    if (!yy_pact_value_is_default_ (yyn))
      {
        /* Start YYX at -YYN if negative to avoid negative indexes in
           YYCHECK.  In other words, skip the first -YYN actions for
           this state because they are default actions.  */
        const int yyxbegin = yyn < 0 ? -yyn : 0;
        // Stay within bounds of both yycheck and yytname.
        const int yychecklim = yylast_ - yyn + 1;
        const int yyxend = yychecklim < YYNTOKENS ? yychecklim : YYNTOKENS;
        for (int yyx = yyxbegin; yyx < yyxend; ++yyx)
          if (yycheck_[yyx + yyn] == yyx && yyx != symbol_kind::S_YYerror
              && !yy_table_value_is_error_ (yytable_[yyx + yyn]))
            {
              if (!yyarg)
                ++yycount;
              else if (yycount == yyargn)
                return 0;
              else
                yyarg[yycount++] = YY_CAST (symbol_kind_type, yyx);
            }
      }

    if (yyarg && yycount == 0 && 0 < yyargn)
      yyarg[0] = symbol_kind::S_YYEMPTY;
    return yycount;
  }






  int
  Parser::yy_syntax_error_arguments_ (const context& yyctx,
                                                 symbol_kind_type yyarg[], int yyargn) const
  {
    /* There are many possibilities here to consider:
       - If this state is a consistent state with a default action, then
         the only way this function was invoked is if the default action
         is an error action.  In that case, don't check for expected
         tokens because there are none.
       - The only way there can be no lookahead present (in yyla) is
         if this state is a consistent state with a default action.
         Thus, detecting the absence of a lookahead is sufficient to
         determine that there is no unexpected or expected token to
         report.  In that case, just report a simple "syntax error".
       - Don't assume there isn't a lookahead just because this state is
         a consistent state with a default action.  There might have
         been a previous inconsistent state, consistent state with a
         non-default action, or user semantic action that manipulated
         yyla.  (However, yyla is currently not documented for users.)
       - Of course, the expected token list depends on states to have
         correct lookahead information, and it depends on the parser not
         to perform extra reductions after fetching a lookahead from the
         scanner and before detecting a syntax error.  Thus, state merging
         (from LALR or IELR) and default reductions corrupt the expected
         token list.  However, the list is correct for canonical LR with
         one exception: it will still contain any token that will not be
         accepted due to an error action in a later state.
    */

    if (!yyctx.lookahead ().empty ())
      {
        if (yyarg)
          yyarg[0] = yyctx.token ();
        int yyn = yyctx.expected_tokens (yyarg ? yyarg + 1 : yyarg, yyargn - 1);
        return yyn + 1;
      }
    return 0;
  }

  // Generate an error message.
  std::string
  Parser::yysyntax_error_ (const context& yyctx) const
  {
    // Its maximum.
    enum { YYARGS_MAX = 5 };
    // Arguments of yyformat.
    symbol_kind_type yyarg[YYARGS_MAX];
    int yycount = yy_syntax_error_arguments_ (yyctx, yyarg, YYARGS_MAX);

    char const* yyformat = YY_NULLPTR;
    switch (yycount)
      {
#define YYCASE_(N, S)                         \
        case N:                               \
          yyformat = S;                       \
        break
      default: // Avoid compiler warnings.
        YYCASE_ (0, YY_("syntax error"));
        YYCASE_ (1, YY_("syntax error, unexpected %s"));
        YYCASE_ (2, YY_("syntax error, unexpected %s, expecting %s"));
        YYCASE_ (3, YY_("syntax error, unexpected %s, expecting %s or %s"));
        YYCASE_ (4, YY_("syntax error, unexpected %s, expecting %s or %s or %s"));
        YYCASE_ (5, YY_("syntax error, unexpected %s, expecting %s or %s or %s or %s"));
#undef YYCASE_
      }

    std::string yyres;
    // Argument number.
    std::ptrdiff_t yyi = 0;
    for (char const* yyp = yyformat; *yyp; ++yyp)
      if (yyp[0] == '%' && yyp[1] == 's' && yyi < yycount)
        {
          yyres += symbol_name (yyarg[yyi++]);
          ++yyp;
        }
      else
        yyres += *yyp;
    return yyres;
  }


  const signed char Parser::yypact_ninf_ = -15;

  const signed char Parser::yytable_ninf_ = -1;

  const short
  Parser::yypact_[] =
  {
     132,   -15,    -7,    11,    24,   -14,    39,     9,    13,    30,
      30,   -15,    30,   -15,   -15,   -15,    40,    36,    79,    44,
     -15,   -15,    41,    66,   -15,   -15,    20,    30,    30,    30,
      30,    30,    30,    30,    30,    30,    30,    30,    30,    30,
      48,    27,   -15,   -15,    -9,    79,    17,    17,   -15,   -15,
     128,   128,   128,   128,   128,   128,    92,   105,    30,   110,
      25,   -15,    30,    30,    42,    31,   -15,   -15,   -15,   -15,
      68,   -15,   -15,    27,    -8,    77,   -15,    51,   -15,   -15,
      71,   -15,    30,    30,   -15,   104,    77,   -15,   -15
  };

  const signed char
  Parser::yydefact_[] =
  {
       0,     2,     0,     0,     0,     0,     0,     0,     0,     0,
       0,    20,     0,    29,    31,    30,     5,    19,    23,     0,
       1,     3,     0,     0,    37,    44,     0,     0,     0,     0,
       0,     0,     0,     0,     0,     0,     0,     0,     0,     0,
       0,     0,    36,    21,     6,    24,    32,    33,    34,    35,
      38,    39,    42,    43,    40,    41,    45,    46,     0,     0,
       0,    11,     0,     0,     0,     0,    15,    16,    17,    18,
       0,    13,     4,     0,     7,     8,    25,    27,    22,    10,
       0,    12,     0,     0,    28,     0,     9,    26,    14
  };

  const signed char
  Parser::yypgoto_[] =
  {
     -15,   -15,   -15,    47,   -15,   -15,   -15,    75,    52,    67,
      -4
  };

  const signed char
  Parser::yydefgoto_[] =
  {
       0,     6,    60,    61,    71,    16,    44,    17,    75,    76,
      77
  };

  const signed char
  Parser::yytable_[] =
  {
      18,     7,    62,    63,    82,    23,    24,    64,    25,    28,
      29,    30,    31,    32,    33,    34,    35,    36,    37,     8,
      38,    39,    19,    45,    46,    47,    48,    49,    50,    51,
      52,    53,    54,    55,    56,    57,    30,    31,     9,    20,
      72,    73,    10,    11,     9,    21,    79,    27,    10,    22,
      26,    12,    27,    40,    18,    41,    43,    12,    74,    13,
      14,    15,    58,    59,    84,    13,    14,    15,    28,    29,
      30,    31,    32,    33,    34,    35,    36,    37,    78,    38,
      39,    42,    80,    28,    29,    30,    31,    32,    33,    34,
      35,    36,    37,    83,    38,    39,    28,    29,    30,    31,
      32,    33,    34,    35,    36,    37,    85,    38,    39,    28,
      29,    30,    31,    32,    33,    34,    35,    36,    37,    88,
      81,    39,    28,    29,    30,    31,    32,    33,    34,    35,
      36,    37,     1,    65,    86,     0,     2,     3,     4,     5,
      66,    67,    68,    69,    70,    28,    29,    30,    31,     0,
      87
  };

  const signed char
  Parser::yycheck_[] =
  {
       4,     8,    11,    12,    12,     9,    10,    16,    12,    17,
      18,    19,    20,    21,    22,    23,    24,    25,    26,     8,
      28,    29,    36,    27,    28,    29,    30,    31,    32,    33,
      34,    35,    36,    37,    38,    39,    19,    20,    14,     0,
      15,    16,    18,    19,    14,    36,    15,    16,    18,    36,
      10,    27,    16,     9,    58,    14,    36,    27,    62,    35,
      36,    37,    14,    36,    13,    35,    36,    37,    17,    18,
      19,    20,    21,    22,    23,    24,    25,    26,    36,    28,
      29,    15,    14,    17,    18,    19,    20,    21,    22,    23,
      24,    25,    26,    16,    28,    29,    17,    18,    19,    20,
      21,    22,    23,    24,    25,    26,    35,    28,    29,    17,
      18,    19,    20,    21,    22,    23,    24,    25,    26,    15,
      73,    29,    17,    18,    19,    20,    21,    22,    23,    24,
      25,    26,     0,    58,    82,    -1,     4,     5,     6,     7,
      30,    31,    32,    33,    34,    17,    18,    19,    20,    -1,
      83
  };

  const signed char
  Parser::yystos_[] =
  {
       0,     0,     4,     5,     6,     7,    44,     8,     8,    14,
      18,    19,    27,    35,    36,    37,    48,    50,    53,    36,
       0,    36,    36,    53,    53,    53,    10,    16,    17,    18,
      19,    20,    21,    22,    23,    24,    25,    26,    28,    29,
       9,    14,    15,    36,    49,    53,    53,    53,    53,    53,
      53,    53,    53,    53,    53,    53,    53,    53,    14,    36,
      45,    46,    11,    12,    16,    50,    30,    31,    32,    33,
      34,    47,    15,    16,    53,    51,    52,    53,    36,    15,
      14,    46,    12,    16,    13,    35,    51,    52,    15
  };

  const signed char
  Parser::yyr1_[] =
  {
       0,    43,    44,    44,    44,    44,    44,    44,    44,    44,
      44,    45,    45,    46,    46,    47,    47,    47,    47,    48,
      48,    49,    49,    50,    50,    51,    51,    52,    52,    53,
      53,    53,    53,    53,    53,    53,    53,    53,    53,    53,
      53,    53,    53,    53,    53,    53,    53
  };

  const signed char
  Parser::yyr2_[] =
  {
       0,     2,     1,     3,     6,     2,     4,     6,     6,     8,
       6,     1,     3,     2,     5,     1,     1,     1,     1,     1,
       1,     1,     3,     1,     3,     1,     3,     1,     2,     1,
       1,     1,     3,     3,     3,     3,     3,     2,     3,     3,
       3,     3,     3,     3,     2,     3,     3
  };




#if YYDEBUG
  const unsigned char
  Parser::yyrline_[] =
  {
       0,    91,    91,    92,    93,    94,    95,    96,    97,    98,
      99,   102,   103,   105,   106,   108,   109,   110,   111,   113,
     114,   116,   117,   119,   120,   122,   123,   125,   126,   128,
     129,   130,   131,   132,   133,   134,   135,   136,   137,   138,
     139,   140,   141,   142,   143,   144,   145
  };

  void
  Parser::yy_stack_print_ () const
  {
    *yycdebug_ << "Stack now";
    for (stack_type::const_iterator
           i = yystack_.begin (),
           i_end = yystack_.end ();
         i != i_end; ++i)
      *yycdebug_ << ' ' << int (i->state);
    *yycdebug_ << '\n';
  }

  void
  Parser::yy_reduce_print_ (int yyrule) const
  {
    int yylno = yyrline_[yyrule];
    int yynrhs = yyr2_[yyrule];
    // Print the symbols being reduced, and their result.
    *yycdebug_ << "Reducing stack by rule " << yyrule - 1
               << " (line " << yylno << "):\n";
    // The symbols being reduced.
    for (int yyi = 0; yyi < yynrhs; yyi++)
      YY_SYMBOL_PRINT ("   $" << yyi + 1 << " =",
                       yystack_[(yynrhs) - (yyi + 1)]);
  }
#endif // YYDEBUG

  Parser::symbol_kind_type
  Parser::yytranslate_ (int t) YY_NOEXCEPT
  {
    // YYTRANSLATE[TOKEN-NUM] -- Symbol number corresponding to
    // TOKEN-NUM as returned by yylex.
    static
    const signed char
    translate_table[] =
    {
       0,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     1,     2,     3,     4,
       5,     6,     7,     8,     9,    10,    11,    12,    13,    14,
      15,    16,    17,    18,    19,    20,    21,    22,    23,    24,
      25,    26,    27,    28,    29,    30,    31,    32,    33,    34,
      35,    36,    37,    38,    39,    40,    41,    42
    };
    // Last valid token kind.
    const int code_max = 297;

    if (t <= 0)
      return symbol_kind::S_YYEOF;
    else if (t <= code_max)
      return static_cast <symbol_kind_type> (translate_table[t]);
    else
      return symbol_kind::S_YYUNDEF;
  }

#line 4 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"
} // shdb
#line 1678 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.cpp"

#line 147 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/parser.y"


void shdb::Parser::error(const std::string& err)
{
	message = err;
}
