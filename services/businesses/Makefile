codegen:
	python3 -m venv venv
	. venv/bin/activate
	python3 -m pip install -r ../../scripts/openapi-c-gen/requirements.txt
	python3 ../../scripts/openapi-c-gen/main.py -i docs/api.yaml -o src/codegen_api

.PHONY: codegen
