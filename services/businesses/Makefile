codegen:
	python3 -m venv venv
	. venv/bin/activate
	venv/bin/python3 -m pip install -r ../../scripts/openapi-c-gen/requirements.txt
	venv/bin/python3 ../../scripts/openapi-c-gen/main.py -i docs/api.yaml -o src/codegen_api

tests:
	../../libraries/bash/bats-core/bin/bats --tap tests/v1_business.bats
	../../libraries/bash/bats-core/bin/bats --tap tests/v1_meal.bats

.PHONY: codegen tests
