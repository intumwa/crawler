# Guide to Running the Crawler (After 30 Months)

This document provides instructions for setting up and running the crawler, incorporating changes that may have occurred between 2022 and 2024.

## Potential Future Changes

Be aware of the following components that may require updates:

- **MySQL Version**: Update the MySQL version in `./docker-compose.yml` as needed.
- **Playwright Version**: Update the Playwright version in both `./Dockerfile` and `./package.json`.
- **Parallel Containers**: Depending on the specifications of the host machine or server, you may need to adjust the number of containers running in parallel in `./run.sh`.

## Database Initialization

The `./db.sql` script is executed during `docker compose --build` and initializes the MySQL database structure, including a list of 100 domain names to crawl. You can modify the database structure or change the list of domain names before running Docker, depending on your requirements.

## Cleaning and Building the Docker Environment

If you need to clean up and rebuild the Docker environment, the following commands may be helpful:

```bash
docker compose down
docker builder prune
rm -rf ../crawl-files-exp1
rm -rf ../crawl-data-exp1
docker compose up --build
```

**Note**: Use these commands carefully, as they will remove existing containers, builder cache, and specified directories. Ensure that you have backups if necessary.

## Exporting Data from Containers

### Standard Procedure

To export data from the containers without issues, you can run:

```bash
docker run --name mysql_recovery \
  -v /path/to/your/crawl-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -p 3307:3306 \
  -d mysql:8.0.34
```

This command creates a new Docker container named `mysql_recovery` using the specified MySQL version. Replace `/path/to/your/crawl-data` with the appropriate path to your data directory, and set `MYSQL_ROOT_PASSWORD` to your MySQL root password.

### In Case of Issues

If you encounter problems starting the MySQL container due to data corruption or other issues, you can perform the following steps:

1. **Create a MySQL Configuration File**

   Create a file named `my.cnf` with the following content:

   ```ini
   [mysqld]
   innodb_force_recovery=1
   ```

   This configuration forces InnoDB to start up even if it encounters corruption, allowing you to recover data.

2. **Stop and Remove Existing Recovery Container (if necessary)**

   If a `mysql_recovery` container is already running and causing issues, stop and remove it:

   ```bash
   docker stop mysql_recovery
   docker rm mysql_recovery
   ```

3. **Run the MySQL Container with Recovery Options**

   Start a new MySQL container with the recovery configuration:

   ```bash
   docker run --name mysql_recovery \
     -v /path/to/your/crawl-data:/var/lib/mysql \
     -v /path/to/your/my.cnf:/etc/mysql/my.cnf \
     -e MYSQL_ROOT_PASSWORD=your_password \
     -p 3307:3306 \
     -d mysql:8.0.34
   ```

   Replace `/path/to/your/crawl-data` and `/path/to/your/my.cnf` with the appropriate paths.

4. **Verify the Database**

   Connect to the MySQL server inside the container to verify that your database (`crawl`) and its tables are present:

   ```bash
   docker exec -it mysql_recovery mysql -u root -p
   ```

   Enter your MySQL root password when prompted.

5. **Export the Database**

   To export the `crawl` database, execute the following commands:

   ```bash
   docker exec -it mysql_recovery bash
   mysqldump -u root -p crawl > /home/crawl.sql
   exit
   docker cp mysql_recovery:/home/crawl.sql .
   ```

   This will create a dump of your `crawl` database and copy it to your local machine.
