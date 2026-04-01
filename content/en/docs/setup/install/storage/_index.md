---
title: "External Storage"
linkTitle: "External Storage"
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

Before you deploy services, you need to manually create a database and user grants.
These are NOT automatically created as part of the start of spinnaker.  Note that
the kustomize example on the install DOES create these as part of the mariadb
[init script](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/components/mariadb/base/configmap.yml#L15).

Repeat these for orca, clouddriver and front50.
```sql
CREATE DATABASE `front50` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT
  SELECT, INSERT, UPDATE, DELETE, CREATE, EXECUTE, SHOW VIEW
ON `front50`.*
TO 'front50_service'@'%'; -- IDENTIFIED BY "password" if using password based auth

GRANT
  SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER, LOCK TABLES, EXECUTE, SHOW VIEW
ON `front50`.*
TO 'front50_migrate'@'%'; -- IDENTIFIED BY "password" if using password based auth
```
Note that the character set is key - using different character sets has been reported
to cause issues.

## Next steps

After you've set up your external storage service, you're ready to [deploy Spinnaker](/docs/setup/install/deploy/).
