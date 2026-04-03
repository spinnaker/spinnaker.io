---
title: "Storage"
linkTitle: "Storage"
weight: 40
description: >
  Spinnaker requires an external storage provider for persisting your Application settings and configured Pipelines.

---

Spinnaker requires a database for persisting your Application settings and configured 
Pipelines as well as execution history.  A database is used for a few services 
(clouddriver, front50, orca). Because this data can be sensitive and can be costly to
lose, we recommend you use a hosted storage solution you are confident in.

## Supported databases
Spinnaker recommends MySQL/MariaDB or Postgresql.  It's recommended for most users to start
with MariaDB/MySQL.  

Services ship with `mysql-connector-java` by default. You can provide additional JDBC 
connectors on the classpath if desired.  MySQL/MariaDB is reported to work all the way
up to version 10 of MariaDB and the latest Aurora MySQL engines.

Before you deploy services, you need to manually create a database and user grants for each service.
These are NOT automatically created when spinnaker services start. Note that
the kustomize example on the install DOES create these as part of the mariadb
[init script](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/components/mariadb/base/configmap.yml#L15).

Repeat these creation steps for echo, orca, clouddriver, fiat and front50 (and keel if using keel) replacing the database for each service
```sql
CREATE DATABASE `front50` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT
  SELECT, INSERT, UPDATE, DELETE, CREATE, EXECUTE, SHOW VIEW
ON `front50`.*
TO 'front50_service'@'%' IDENTIFIED BY "password";

GRANT
  SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER, LOCK TABLES, EXECUTE, SHOW VIEW
ON `front50`.*
TO 'front50_migrate'@'%' IDENTIFIED BY "password";
```

## Configure the services
Configure the services (when not using the native mariadb component in kustomize) to use the SQL configuration passed above.  AN example
for mariadb:
```yaml
sql:
  enabled: true
  connectionPools:
    default:
      default: true
      # additional connection pool parameters are available here,
      # for more detail and to view defaults, see:
      # https://github.com/spinnaker/kork/blob/master/kork-sql/src/main/kotlin/com/netflix/spinnaker/kork/sql/config/ConnectionPoolProperties.kt
      jdbcUrl: jdbc:mysql://mariadb:3306/fiat
      user: fiat_service
      password: ${FIAT_MARIADB}
  migration:
    jdbcUrl: jdbc:mysql://mariadb:3306/fiat
    user: fiat_migrate
    password: ${FIAT_MARIADB}
```
The default spinnaker-kustomize installation uses a [component to auto inject](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/components/mariadb/kustomization.yml) these configurations
into the targeted services.  

## Next steps
After you've set up your external storage service, you're ready to [deploy Spinnaker](/docs/setup/install/deploy/).
