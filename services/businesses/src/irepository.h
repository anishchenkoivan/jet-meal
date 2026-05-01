#ifndef IREPOSITORY_H
#define IREPOSITORY_H

#include <stddef.h>

#include "codegen_api.h"

#define DB_ERROR -1

typedef struct ibusinesses_repository_vtable_s {
  // Returns result business id or DB_ERROR
  size_t (*insert_business)(void *self, api_gen_business_t *business);

  // Returns count of affected rows or DB_ERROR
  size_t (*update_business)(void *self, size_t business_id,
                            api_gen_business_t *business);
  size_t (*delete_business)(void *self, size_t businesses_id);

  // On error res.businessId == NULL
  api_gen_business_t (*get_business)(void *self, size_t business_id);
} ibusinesses_repository_vtable_t;

typedef struct imeals_repository_vtable_s {
  // Returns id of inserted meal or DB_ERROR
  size_t (*insert_meal)(void *self, size_t business_id, api_gen_meal_t *meal);

  // Returns count of affected rows or DB_ERROR
  size_t (*delete_meal)(void *self, size_t business_id, size_t meal_id);

  // On error res.size == DB_ERROR
  api_gen_meals_list_t (*get_meals_by_business)(void *self, size_t business_id);
} imeals_repository_vtable_t;

#endif // #ifndef IREPOSITORY_H
