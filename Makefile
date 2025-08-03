run:
	docker run -d -p 5000:5000 --mount type=bind,source=$(pwd)/our-family/photos,destination=/app/photos --rm --name our_family family_tree:latest
stop:
	docker stop our-family