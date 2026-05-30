.PHONY: docker-up docker-up-chain docker-down docker-logs docker-reset

docker-up:
	cp -n .env.docker.example .env 2>/dev/null || true
	docker compose up --build -d

docker-up-chain:
	cp -n .env.docker.example .env 2>/dev/null || true
	@grep -q '^SKIP_BLOCKCHAIN=false' .env 2>/dev/null || echo "SKIP_BLOCKCHAIN=false" >> .env
	docker compose --profile blockchain up --build -d

docker-down:
	docker compose --profile blockchain down

docker-logs:
	docker compose --profile blockchain logs -f

docker-reset:
	docker compose --profile blockchain down -v
