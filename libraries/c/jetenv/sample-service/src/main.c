#include "jetenv.h"

#include <stdio.h>

JETENV_REGISTER_STRING(get_sample_string, "SAMPLE_STRING", "default_sample_string");
JETENV_REGISTER_INT(get_sample_int, "SAMPLE_INT", 228);

int main(void) {
  printf("SAMPLE_STRING=%s\n", get_sample_string());
  printf("SAMPLE_INT=%d\n", get_sample_int());
}

