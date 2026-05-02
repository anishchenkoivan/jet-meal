import shutil
import subprocess
import time

import pytest
import requests

COMPOSE_FILE = "tests/docker-compose.yaml"
BASE_URL = "http://localhost:18081"


def _compose() -> list[str]:
    if shutil.which("docker-compose"):
        return ["docker-compose"]
    return ["docker", "compose"]


def _service_ready() -> bool:
    try:
        return requests.get(f"{BASE_URL}/health", timeout=1).status_code == 200
    except requests.exceptions.ConnectionError:
        return False


@pytest.fixture(scope="session", autouse=True)
def billing_service():
    compose = _compose()
    print(f"\n[setup] building and starting containers ({' '.join(compose)})...")
    subprocess.run([*compose, "-f", COMPOSE_FILE, "up", "--build", "-d"], check=True)

    print("[setup] waiting for billing service to be ready...", flush=True)
    for i in range(120):
        if _service_ready():
            print(f"[setup] service is up (after {i * 0.5:.1f}s)")
            break
        if i > 0 and i % 20 == 0:
            print(f"[setup] still waiting... ({i * 0.5:.0f}s elapsed)", flush=True)
        time.sleep(0.5)
    else:
        print("[setup] service did not start in time, dumping logs:")
        subprocess.run([*compose, "-f", COMPOSE_FILE, "logs"])
        subprocess.run([*compose, "-f", COMPOSE_FILE, "down"])
        pytest.fail("billing service did not start in time")

    yield BASE_URL

    print("\n[teardown] stopping containers...")
    subprocess.run([*compose, "-f", COMPOSE_FILE, "down"], check=True)
    print("[teardown] done")


@pytest.fixture
def url(billing_service):
    return billing_service
