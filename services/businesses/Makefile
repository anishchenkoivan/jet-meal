codegen:
	python3 -m venv venv
	. venv/bin/activate
	python3 -m pip install -r ../../scripts/openapi-c-gen/requirements.txt
	python3 ../../scripts/openapi-c-gen/main.py -i docs/api.yaml -o src/codegen_api

compose_up_prod:
	docker-compose up --build -d

compose_up_test:
	docker-compose -f docker-compose.yml -f docker-compose.sanitizer.yml up --build

compose_down:
	docker-compose down

.PHONY: codegen, compose_up_prod, compose_up_test, compose_down
