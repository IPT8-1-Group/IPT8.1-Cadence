.PHONY: b bh d dv r

b: 
	docker compose up --build

bh:
	docker compose up --build -d

u: 
	docker compose up

s:
	docker compose stop

d: 
	docker compose down

dv:
	docker compose down -v

r: dv b

rh: dv bh
	