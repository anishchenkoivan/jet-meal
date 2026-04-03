tests:
	mkdir -p build
	cmake -DBUILD_TESTS=ON -S . -B build
	make -C build
	./build/penguin_malloc_tests

.PHONY: tests
