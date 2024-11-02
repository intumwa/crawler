# A reckless guide to getting this crawler to run (after 30 months!)

Here are possible things to change in the future, as did change between 2022 and 2024.

- MySQL version in `./docker-compose.yml`
- Playwright version in `./Dockerfile` and `./package.json`
- Depending on the host PC/server, the number of containers that run in parallel may change in ./run.sh

Other than that, I've added `./db.sql` script that is run upon `docker compose --build` and contains the database (MySQL) structure + 100 domain names to crawl. The DB structure can be changed aside before running Docker, especially concerning which or how many domain names to crawl.

I've found the following handy as I was cleaning and running Docker (back and forth because I had forgotten a lot of details concerning environment/configs --- take this with a grain of salt, or don't):

```
docker compose down
docker builder prune
rm -rf ../crawl-files-exp1
rm -rf ../crawl-data-exp1
docker compose up --build
```
I hope this is enough for the next time I'll tinker with the repo 🥴 

Another dump of commands to export data out of containers.

If nothing to worry about:

```
docker run --name mysql_recovery \
  -v /Users/intumwa/workspace/crawl-data-exp1 \
  -e MYSQL_ROOT_PASSWORD=jeanluc \
  -p 3307:3306 \
  -d mysql:8.0.34
```

If there's trouble:

Create `my.cf`:

```
[mysqld]
innodb_force_recovery=1
```

Do (if necessarry):

```
docker stop mysql_recovery
docker rm mysql_recovery

```

Then run:

```
docker run --name mysql_recovery \
  -v /Users/intumwa/workspace/crawl-data-exp1:/var/lib/mysql \
  -v /Users/intumwa/workspace/exp1/my.cnf:/etc/mysql/my.cnf \
  -e MYSQL_ROOT_PASSWORD=jeanluc \
  -p 3307:3306 \
  -d mysql:8.0.34
```

`docker exec -it mysql_recovery mysql -u root -p` (to check that database `crawl` is there, that its tables and data are there)

```
docker exec -it mysql_recovery bash
mysqldump -u root -p crawl > /home/crawl.sql
exit
docker cp mysql_recovery:/home/crawl.sql .
```
