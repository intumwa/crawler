#!/bin/bash
# Function to run docker containers in parallel
docker_func(){
  docker exec crawler_jeanluc sh -c "node app.js"
  sleep 1
}
# For loop 20 times
for i in {1..20}
do
	docker_func $i & # Put a function in the background
done

## Put all docker_func in the background and bash
## would wait until those are completed
## before displaying all done message
wait
if pgrep -x "node" > /dev/null
then
mv -f  /usr/local/bin/node /usr/local/bin/node.1
killall  node
mv -f /usr/local/bin/node.1 /usr/local/bin/node
which node
else
echo "process node no longer exists"
fi
