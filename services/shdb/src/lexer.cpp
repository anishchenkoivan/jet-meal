#line 1 "lexer.l"
#include "lexer.h"

namespace shdb {
	

#line 6 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"
static const signed char _lexer_actions[] = {
		0, 1, 0, 1, 1, 1, 2, 1,
		21, 1, 22, 1, 23, 1, 24, 1,
		25, 1, 26, 1, 27, 1, 28, 1,
		29, 1, 30, 1, 31, 1, 32, 1,
		33, 1, 34, 1, 35, 1, 36, 1,
		37, 1, 38, 1, 39, 1, 40, 2,
		2, 3, 2, 2, 4, 2, 2, 5,
		2, 2, 6, 2, 2, 7, 2, 2,
		8, 2, 2, 9, 2, 2, 10, 2,
		2, 11, 2, 2, 12, 2, 2, 13,
		2, 2, 14, 2, 2, 15, 2, 2,
		16, 2, 2, 17, 2, 2, 18, 2,
		2, 19, 2, 2, 20, 0
	};
	
	static const short _lexer_key_offsets[] = {
		0, 0, 1, 5, 12, 13, 14, 15,
		53, 55, 56, 57, 64, 72, 80, 88,
		96, 104, 113, 121, 129, 137, 145, 153,
		161, 169, 177, 185, 193, 201, 209, 217,
		225, 233, 241, 249, 257, 265, 273, 281,
		289, 297, 305, 313, 321, 329, 337, 345,
		353, 361, 369, 377, 385, 393, 401, 409,
		417, 425, 433, 441, 449, 457, 465, 473,
		481, 489, 497, 505, 513, 521, 529, 537,
		545, 553, 561, 569, 577, 585, 593, 601,
		609, 617, 625, 633, 0
	};
	
	static const char _lexer_trans_keys[] = {
		61, 65, 90, 97, 122, 34, 48, 57,
		65, 90, 97, 122, 61, 66, 89, 32,
		33, 34, 40, 41, 42, 43, 44, 45,
		47, 60, 61, 62, 67, 68, 70, 73,
		79, 83, 84, 86, 87, 97, 98, 105,
		110, 111, 115, 117, 118, 9, 13, 48,
		57, 65, 90, 99, 122, 48, 57, 61,
		61, 95, 48, 57, 65, 90, 97, 122,
		82, 95, 48, 57, 65, 90, 97, 122,
		69, 95, 48, 57, 65, 90, 97, 122,
		65, 95, 48, 57, 66, 90, 97, 122,
		84, 95, 48, 57, 65, 90, 97, 122,
		69, 95, 48, 57, 65, 90, 97, 122,
		69, 82, 95, 48, 57, 65, 90, 97,
		122, 83, 95, 48, 57, 65, 90, 97,
		122, 67, 95, 48, 57, 65, 90, 97,
		122, 79, 95, 48, 57, 65, 90, 97,
		122, 80, 95, 48, 57, 65, 90, 97,
		122, 82, 95, 48, 57, 65, 90, 97,
		122, 79, 95, 48, 57, 65, 90, 97,
		122, 77, 95, 48, 57, 65, 90, 97,
		122, 78, 95, 48, 57, 65, 90, 97,
		122, 83, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 82, 95, 48, 57, 65, 90, 97,
		122, 84, 95, 48, 57, 65, 90, 97,
		122, 82, 95, 48, 57, 65, 90, 97,
		122, 68, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 82, 95, 48, 57, 65, 90, 97,
		122, 32, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 76, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 67, 95, 48, 57, 65, 90, 97,
		122, 84, 95, 48, 57, 65, 90, 97,
		122, 65, 95, 48, 57, 66, 90, 97,
		122, 66, 95, 48, 57, 65, 90, 97,
		122, 76, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 65, 95, 48, 57, 66, 90, 97,
		122, 76, 95, 48, 57, 65, 90, 97,
		122, 85, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 83, 95, 48, 57, 65, 90, 97,
		122, 72, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 82, 95, 48, 57, 65, 90, 97,
		122, 69, 95, 48, 57, 65, 90, 97,
		122, 95, 110, 48, 57, 65, 90, 97,
		122, 95, 100, 48, 57, 65, 90, 97,
		122, 95, 111, 48, 57, 65, 90, 97,
		122, 95, 111, 48, 57, 65, 90, 97,
		122, 95, 108, 48, 57, 65, 90, 97,
		122, 95, 101, 48, 57, 65, 90, 97,
		122, 95, 97, 48, 57, 65, 90, 98,
		122, 95, 110, 48, 57, 65, 90, 97,
		122, 95, 110, 48, 57, 65, 90, 97,
		122, 95, 116, 48, 57, 65, 90, 97,
		122, 54, 95, 48, 57, 65, 90, 97,
		122, 52, 95, 48, 57, 65, 90, 97,
		122, 95, 111, 48, 57, 65, 90, 97,
		122, 95, 116, 48, 57, 65, 90, 97,
		122, 95, 114, 48, 57, 65, 90, 97,
		122, 95, 116, 48, 57, 65, 90, 97,
		122, 95, 114, 48, 57, 65, 90, 97,
		122, 95, 105, 48, 57, 65, 90, 97,
		122, 95, 110, 48, 57, 65, 90, 97,
		122, 95, 103, 48, 57, 65, 90, 97,
		122, 95, 105, 48, 57, 65, 90, 97,
		122, 95, 110, 48, 57, 65, 90, 97,
		122, 95, 116, 48, 57, 65, 90, 97,
		122, 54, 95, 48, 57, 65, 90, 97,
		122, 52, 95, 48, 57, 65, 90, 97,
		122, 95, 97, 48, 57, 65, 90, 98,
		122, 95, 114, 48, 57, 65, 90, 97,
		122, 95, 99, 48, 57, 65, 90, 97,
		122, 95, 104, 48, 57, 65, 90, 97,
		122, 95, 97, 48, 57, 65, 90, 98,
		122, 95, 114, 48, 57, 65, 90, 97,
		122, 0
	};
	
	static const signed char _lexer_single_lengths[] = {
		0, 1, 0, 1, 1, 1, 1, 30,
		0, 1, 1, 1, 2, 2, 2, 2,
		2, 3, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 0
	};
	
	static const signed char _lexer_range_lengths[] = {
		0, 0, 2, 3, 0, 0, 0, 4,
		1, 0, 0, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 0
	};
	
	static const short _lexer_index_offsets[] = {
		0, 0, 2, 5, 10, 12, 14, 16,
		51, 53, 55, 57, 62, 68, 74, 80,
		86, 92, 99, 105, 111, 117, 123, 129,
		135, 141, 147, 153, 159, 165, 171, 177,
		183, 189, 195, 201, 207, 213, 219, 225,
		231, 237, 243, 249, 255, 261, 267, 273,
		279, 285, 291, 297, 303, 309, 315, 321,
		327, 333, 339, 345, 351, 357, 363, 369,
		375, 381, 387, 393, 399, 405, 411, 417,
		423, 429, 435, 441, 447, 453, 459, 465,
		471, 477, 483, 489, 0
	};
	
	static const signed char _lexer_cond_targs[] = {
		7, 0, 3, 3, 0, 7, 3, 3,
		3, 0, 7, 0, 6, 7, 7, 7,
		7, 1, 2, 7, 7, 7, 7, 7,
		7, 7, 9, 4, 10, 12, 17, 22,
		25, 30, 35, 40, 44, 49, 53, 55,
		61, 65, 67, 68, 73, 78, 7, 8,
		11, 11, 0, 8, 7, 7, 7, 7,
		7, 11, 11, 11, 11, 7, 13, 11,
		11, 11, 11, 7, 14, 11, 11, 11,
		11, 7, 15, 11, 11, 11, 11, 7,
		16, 11, 11, 11, 11, 7, 11, 11,
		11, 11, 11, 7, 18, 20, 11, 11,
		11, 11, 7, 19, 11, 11, 11, 11,
		7, 11, 11, 11, 11, 11, 7, 21,
		11, 11, 11, 11, 7, 11, 11, 11,
		11, 11, 7, 23, 11, 11, 11, 11,
		7, 24, 11, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 26, 11, 11,
		11, 11, 7, 27, 11, 11, 11, 11,
		7, 28, 11, 11, 11, 11, 7, 29,
		11, 11, 11, 11, 7, 11, 11, 11,
		11, 11, 7, 31, 11, 11, 11, 11,
		7, 32, 11, 11, 11, 11, 7, 33,
		11, 11, 11, 11, 7, 34, 11, 11,
		11, 11, 7, 5, 11, 11, 11, 11,
		7, 36, 11, 11, 11, 11, 7, 37,
		11, 11, 11, 11, 7, 38, 11, 11,
		11, 11, 7, 39, 11, 11, 11, 11,
		7, 11, 11, 11, 11, 11, 7, 41,
		11, 11, 11, 11, 7, 42, 11, 11,
		11, 11, 7, 43, 11, 11, 11, 11,
		7, 11, 11, 11, 11, 11, 7, 45,
		11, 11, 11, 11, 7, 46, 11, 11,
		11, 11, 7, 47, 11, 11, 11, 11,
		7, 48, 11, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 50, 11, 11,
		11, 11, 7, 51, 11, 11, 11, 11,
		7, 52, 11, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 11, 54, 11,
		11, 11, 7, 11, 11, 11, 11, 11,
		7, 11, 56, 11, 11, 11, 7, 11,
		57, 11, 11, 11, 7, 11, 58, 11,
		11, 11, 7, 11, 59, 11, 11, 11,
		7, 11, 60, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 11, 62, 11,
		11, 11, 7, 11, 63, 11, 11, 11,
		7, 64, 11, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 11, 66, 11,
		11, 11, 7, 11, 11, 11, 11, 11,
		7, 11, 11, 11, 11, 11, 7, 11,
		69, 11, 11, 11, 7, 11, 70, 11,
		11, 11, 7, 11, 71, 11, 11, 11,
		7, 11, 72, 11, 11, 11, 7, 11,
		11, 11, 11, 11, 7, 11, 74, 11,
		11, 11, 7, 11, 75, 11, 11, 11,
		7, 11, 76, 11, 11, 11, 7, 77,
		11, 11, 11, 11, 7, 11, 11, 11,
		11, 11, 7, 11, 79, 11, 11, 11,
		7, 11, 80, 11, 11, 11, 7, 11,
		81, 11, 11, 11, 7, 11, 82, 11,
		11, 11, 7, 11, 83, 11, 11, 11,
		7, 11, 11, 11, 11, 11, 7, 0,
		1, 2, 3, 4, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 0
	};
	
	static const signed char _lexer_cond_actions[] = {
		25, 0, 0, 0, 0, 31, 0, 0,
		0, 0, 23, 0, 0, 43, 7, 43,
		33, 0, 0, 9, 11, 19, 15, 13,
		17, 21, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 33, 0,
		98, 98, 0, 0, 35, 27, 37, 29,
		39, 98, 98, 98, 98, 45, 0, 98,
		98, 98, 98, 41, 0, 98, 98, 98,
		98, 41, 0, 98, 98, 98, 98, 41,
		0, 98, 98, 98, 98, 41, 50, 98,
		98, 98, 98, 41, 0, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 71, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 47, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 68,
		98, 98, 98, 98, 41, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 56, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 5, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 53, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 59, 98, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 62,
		98, 98, 98, 98, 41, 0, 98, 98,
		98, 98, 41, 0, 98, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 65,
		98, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 95, 98, 98, 98,
		41, 98, 0, 98, 98, 98, 41, 98,
		0, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 98, 0, 98, 98, 98, 41, 98,
		74, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 0, 98, 98, 98, 98, 41, 80,
		98, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 89, 98, 98, 98,
		41, 98, 92, 98, 98, 98, 41, 98,
		0, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 98, 0, 98, 98, 98, 41, 98,
		83, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 98, 0, 98, 98, 98, 41, 0,
		98, 98, 98, 98, 41, 77, 98, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 98, 0, 98, 98, 98, 41, 98,
		0, 98, 98, 98, 41, 98, 0, 98,
		98, 98, 41, 98, 0, 98, 98, 98,
		41, 98, 86, 98, 98, 98, 41, 0,
		0, 0, 0, 0, 43, 43, 0, 35,
		37, 39, 45, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 41, 41, 41, 41, 41,
		41, 41, 41, 0
	};
	
	static const signed char _lexer_to_state_actions[] = {
		0, 0, 0, 0, 0, 0, 0, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0
	};
	
	static const signed char _lexer_from_state_actions[] = {
		0, 0, 0, 0, 0, 0, 0, 3,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0
	};
	
	static const short _lexer_eof_trans[] = {
		496, 497, 498, 499, 500, 501, 502, 503,
		504, 505, 506, 507, 508, 509, 510, 511,
		512, 513, 514, 515, 516, 517, 518, 519,
		520, 521, 522, 523, 524, 525, 526, 527,
		528, 529, 530, 531, 532, 533, 534, 535,
		536, 537, 538, 539, 540, 541, 542, 543,
		544, 545, 546, 547, 548, 549, 550, 551,
		552, 553, 554, 555, 556, 557, 558, 559,
		560, 561, 562, 563, 564, 565, 566, 567,
		568, 569, 570, 571, 572, 573, 574, 575,
		576, 577, 578, 579, 0
	};
	
	static const int lexer_start = 7;
	static const int lexer_first_final = 7;
	static const int lexer_error = 0;
	
	static const int lexer_en_main = 7;
	
	
#line 69 "lexer.l"

	
	
	Lexer::Lexer(const char *p, const char *pe)
	: p(p), pe(pe), eof(pe)
	{

#line 369 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"
	{
			cs = (int)lexer_start;
			ts = 0;
			te = 0;
			act = 0;
		}
		
#line 75 "lexer.l"

	}
	
	Parser::token_type Lexer::lex(Parser::semantic_type* val)
	{
		Parser::token_type ret = Parser::token::END;

#line 382 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"
	{
			int _klen;
			unsigned int _trans = 0;
			const char * _keys;
			const signed char * _acts;
			unsigned int _nacts;
			_resume: {}
			if ( p == pe && p != eof )
				goto _out;
			_acts = ( _lexer_actions + (_lexer_from_state_actions[cs]));
			_nacts = (unsigned int)(*( _acts));
			_acts += 1;
			while ( _nacts > 0 ) {
				switch ( (*( _acts)) ) {
					case 1:  {
							{
#line 1 "NONE"
							{ts = p;}}
						
#line 401 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

						break; 
					}
				}
				_nacts -= 1;
				_acts += 1;
			}
			
			if ( p == eof ) {
				if ( _lexer_eof_trans[cs] > 0 ) {
					_trans = (unsigned int)_lexer_eof_trans[cs] - 1;
				}
			}
			else {
				_keys = ( _lexer_trans_keys + (_lexer_key_offsets[cs]));
				_trans = (unsigned int)_lexer_index_offsets[cs];
				
				_klen = (int)_lexer_single_lengths[cs];
				if ( _klen > 0 ) {
					const char *_lower = _keys;
					const char *_upper = _keys + _klen - 1;
					const char *_mid;
					while ( 1 ) {
						if ( _upper < _lower ) {
							_keys += _klen;
							_trans += (unsigned int)_klen;
							break;
						}
						
						_mid = _lower + ((_upper-_lower) >> 1);
						if ( ( (*( p))) < (*( _mid)) )
							_upper = _mid - 1;
						else if ( ( (*( p))) > (*( _mid)) )
							_lower = _mid + 1;
						else {
							_trans += (unsigned int)(_mid - _keys);
							goto _match;
						}
					}
				}
				
				_klen = (int)_lexer_range_lengths[cs];
				if ( _klen > 0 ) {
					const char *_lower = _keys;
					const char *_upper = _keys + (_klen<<1) - 2;
					const char *_mid;
					while ( 1 ) {
						if ( _upper < _lower ) {
							_trans += (unsigned int)_klen;
							break;
						}
						
						_mid = _lower + (((_upper-_lower) >> 1) & ~1);
						if ( ( (*( p))) < (*( _mid)) )
							_upper = _mid - 2;
						else if ( ( (*( p))) > (*( _mid + 1)) )
							_lower = _mid + 2;
						else {
							_trans += (unsigned int)((_mid - _keys)>>1);
							break;
						}
					}
				}
				
				_match: {}
			}
			cs = (int)_lexer_cond_targs[_trans];
			
			if ( _lexer_cond_actions[_trans] != 0 ) {
				
				_acts = ( _lexer_actions + (_lexer_cond_actions[_trans]));
				_nacts = (unsigned int)(*( _acts));
				_acts += 1;
				while ( _nacts > 0 ) {
					switch ( (*( _acts)) )
					{
						case 2:  {
								{
#line 1 "NONE"
								{te = p+1;}}
							
#line 482 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 3:  {
								{
#line 15 "lexer.l"
								{act = 2;}}
							
#line 490 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 4:  {
								{
#line 16 "lexer.l"
								{act = 3;}}
							
#line 498 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 5:  {
								{
#line 17 "lexer.l"
								{act = 4;}}
							
#line 506 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 6:  {
								{
#line 18 "lexer.l"
								{act = 5;}}
							
#line 514 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 7:  {
								{
#line 19 "lexer.l"
								{act = 6;}}
							
#line 522 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 8:  {
								{
#line 20 "lexer.l"
								{act = 7;}}
							
#line 530 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 9:  {
								{
#line 21 "lexer.l"
								{act = 8;}}
							
#line 538 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 10:  {
								{
#line 22 "lexer.l"
								{act = 9;}}
							
#line 546 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 11:  {
								{
#line 24 "lexer.l"
								{act = 11;}}
							
#line 554 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 12:  {
								{
#line 26 "lexer.l"
								{act = 12;}}
							
#line 562 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 13:  {
								{
#line 27 "lexer.l"
								{act = 13;}}
							
#line 570 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 14:  {
								{
#line 28 "lexer.l"
								{act = 14;}}
							
#line 578 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 15:  {
								{
#line 29 "lexer.l"
								{act = 15;}}
							
#line 586 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 16:  {
								{
#line 30 "lexer.l"
								{act = 16;}}
							
#line 594 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 17:  {
								{
#line 48 "lexer.l"
								{act = 30;}}
							
#line 602 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 18:  {
								{
#line 49 "lexer.l"
								{act = 31;}}
							
#line 610 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 19:  {
								{
#line 50 "lexer.l"
								{act = 32;}}
							
#line 618 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 20:  {
								{
#line 59 "lexer.l"
								{act = 34;}}
							
#line 626 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 21:  {
								{
#line 23 "lexer.l"
								{te = p+1;{
#line 23 "lexer.l"
										ret = Parser::token::ORDER_BY; {p += 1; goto _out; } }
								}}
							
#line 637 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 22:  {
								{
#line 32 "lexer.l"
								{te = p+1;{
#line 32 "lexer.l"
										ret = Parser::token::LPAR; {p += 1; goto _out; } }
								}}
							
#line 648 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 23:  {
								{
#line 33 "lexer.l"
								{te = p+1;{
#line 33 "lexer.l"
										ret = Parser::token::RPAR; {p += 1; goto _out; } }
								}}
							
#line 659 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 24:  {
								{
#line 34 "lexer.l"
								{te = p+1;{
#line 34 "lexer.l"
										ret = Parser::token::COMMA; {p += 1; goto _out; } }
								}}
							
#line 670 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 25:  {
								{
#line 36 "lexer.l"
								{te = p+1;{
#line 36 "lexer.l"
										ret = Parser::token::PLUS; {p += 1; goto _out; } }
								}}
							
#line 681 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 26:  {
								{
#line 37 "lexer.l"
								{te = p+1;{
#line 37 "lexer.l"
										ret = Parser::token::MINUS; {p += 1; goto _out; } }
								}}
							
#line 692 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 27:  {
								{
#line 38 "lexer.l"
								{te = p+1;{
#line 38 "lexer.l"
										ret = Parser::token::MUL; {p += 1; goto _out; } }
								}}
							
#line 703 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 28:  {
								{
#line 39 "lexer.l"
								{te = p+1;{
#line 39 "lexer.l"
										ret = Parser::token::DIV; {p += 1; goto _out; } }
								}}
							
#line 714 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 29:  {
								{
#line 41 "lexer.l"
								{te = p+1;{
#line 41 "lexer.l"
										ret = Parser::token::EQ; {p += 1; goto _out; } }
								}}
							
#line 725 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 30:  {
								{
#line 42 "lexer.l"
								{te = p+1;{
#line 42 "lexer.l"
										ret = Parser::token::NEQ; {p += 1; goto _out; } }
								}}
							
#line 736 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 31:  {
								{
#line 43 "lexer.l"
								{te = p+1;{
#line 43 "lexer.l"
										ret = Parser::token::LE; {p += 1; goto _out; } }
								}}
							
#line 747 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 32:  {
								{
#line 44 "lexer.l"
								{te = p+1;{
#line 44 "lexer.l"
										ret = Parser::token::GE; {p += 1; goto _out; } }
								}}
							
#line 758 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 33:  {
								{
#line 52 "lexer.l"
								{te = p+1;{
#line 52 "lexer.l"
										
										ret = Parser::token::STRING_LITERAL;
										Parser::semantic_type str(std::string(ts + 1, te - 1));
										val->move<std::string>(str);
										{p += 1; goto _out; }
									}
								}}
							
#line 774 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 34:  {
								{
#line 1 "-"
								{te = p+1;}}
							
#line 782 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 35:  {
								{
#line 8 "lexer.l"
								{te = p;p = p - 1;{
#line 8 "lexer.l"
										
										ret = Parser::token::NUM;
										Parser::semantic_type num(strtol(std::string(ts, te).c_str(), 0, 10));
										val->move<int>(num);
										{p += 1; goto _out; }
									}
								}}
							
#line 798 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 36:  {
								{
#line 45 "lexer.l"
								{te = p;p = p - 1;{
#line 45 "lexer.l"
										ret = Parser::token::LT; {p += 1; goto _out; } }
								}}
							
#line 809 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 37:  {
								{
#line 46 "lexer.l"
								{te = p;p = p - 1;{
#line 46 "lexer.l"
										ret = Parser::token::GT; {p += 1; goto _out; } }
								}}
							
#line 820 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 38:  {
								{
#line 59 "lexer.l"
								{te = p;p = p - 1;{
#line 59 "lexer.l"
										
										ret = Parser::token::NAME;
										Parser::semantic_type str(std::string(ts, te));
										val->move<std::string>(str);
										{p += 1; goto _out; }
									}
								}}
							
#line 836 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 39:  {
								{
#line 59 "lexer.l"
								{p = ((te))-1;
									{
#line 59 "lexer.l"
										
										ret = Parser::token::NAME;
										Parser::semantic_type str(std::string(ts, te));
										val->move<std::string>(str);
										{p += 1; goto _out; }
									}
								}}
							
#line 853 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
						case 40:  {
								{
#line 1 "NONE"
								{switch( act ) {
										case 2:  {
											p = ((te))-1;
											{
#line 15 "lexer.l"
												ret = Parser::token::DROP; {p += 1; goto _out; } }
											break; 
										}
										case 3:  {
											p = ((te))-1;
											{
#line 16 "lexer.l"
												ret = Parser::token::CREATE; {p += 1; goto _out; } }
											break; 
										}
										case 4:  {
											p = ((te))-1;
											{
#line 17 "lexer.l"
												ret = Parser::token::SELECT; {p += 1; goto _out; } }
											break; 
										}
										case 5:  {
											p = ((te))-1;
											{
#line 18 "lexer.l"
												ret = Parser::token::INSERT; {p += 1; goto _out; } }
											break; 
										}
										case 6:  {
											p = ((te))-1;
											{
#line 19 "lexer.l"
												ret = Parser::token::TABLE; {p += 1; goto _out; } }
											break; 
										}
										case 7:  {
											p = ((te))-1;
											{
#line 20 "lexer.l"
												ret = Parser::token::VALUES; {p += 1; goto _out; } }
											break; 
										}
										case 8:  {
											p = ((te))-1;
											{
#line 21 "lexer.l"
												ret = Parser::token::WHERE; {p += 1; goto _out; } }
											break; 
										}
										case 9:  {
											p = ((te))-1;
											{
#line 22 "lexer.l"
												ret = Parser::token::FROM; {p += 1; goto _out; } }
											break; 
										}
										case 11:  {
											p = ((te))-1;
											{
#line 24 "lexer.l"
												ret = Parser::token::DESC; {p += 1; goto _out; } }
											break; 
										}
										case 12:  {
											p = ((te))-1;
											{
#line 26 "lexer.l"
												ret = Parser::token::BOOLEAN; {p += 1; goto _out; } }
											break; 
										}
										case 13:  {
											p = ((te))-1;
											{
#line 27 "lexer.l"
												ret = Parser::token::UINT64; {p += 1; goto _out; } }
											break; 
										}
										case 14:  {
											p = ((te))-1;
											{
#line 28 "lexer.l"
												ret = Parser::token::INT64; {p += 1; goto _out; } }
											break; 
										}
										case 15:  {
											p = ((te))-1;
											{
#line 29 "lexer.l"
												ret = Parser::token::STRING; {p += 1; goto _out; } }
											break; 
										}
										case 16:  {
											p = ((te))-1;
											{
#line 30 "lexer.l"
												ret = Parser::token::VARCHAR; {p += 1; goto _out; } }
											break; 
										}
										case 30:  {
											p = ((te))-1;
											{
#line 48 "lexer.l"
												ret = Parser::token::NOT; {p += 1; goto _out; } }
											break; 
										}
										case 31:  {
											p = ((te))-1;
											{
#line 49 "lexer.l"
												ret = Parser::token::OR; {p += 1; goto _out; } }
											break; 
										}
										case 32:  {
											p = ((te))-1;
											{
#line 50 "lexer.l"
												ret = Parser::token::AND; {p += 1; goto _out; } }
											break; 
										}
										case 34:  {
											p = ((te))-1;
											{
#line 59 "lexer.l"
												
												ret = Parser::token::NAME;
												Parser::semantic_type str(std::string(ts, te));
												val->move<std::string>(str);
												{p += 1; goto _out; }
											}
											break; 
										}
									}}
							}
							
#line 994 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
					}
					_nacts -= 1;
					_acts += 1;
				}
				
			}
			
			if ( p == eof ) {
				if ( cs >= 7 )
					goto _out;
			}
			else {
				_acts = ( _lexer_actions + (_lexer_to_state_actions[cs]));
				_nacts = (unsigned int)(*( _acts));
				_acts += 1;
				while ( _nacts > 0 ) {
					switch ( (*( _acts)) ) {
						case 0:  {
								{
#line 1 "NONE"
								{ts = 0;}}
							
#line 1019 "/home/ivan/Education/db-shad/public-2025-fall/shdb/src/lexer.cpp"

							break; 
						}
					}
					_nacts -= 1;
					_acts += 1;
				}
				
				if ( cs != 0 ) {
					p += 1;
					goto _resume;
				}
			}
			_out: {}
		}
		
#line 81 "lexer.l"

		
		if (ret == Parser::token::END && p != pe && te != pe) {
			std::cerr << "Unexpected input: \"" << std::string(te, pe) << "\"" << std::endl;
			ret = Parser::token::ERROR;
		}
		
		return ret;
	}
	
}
