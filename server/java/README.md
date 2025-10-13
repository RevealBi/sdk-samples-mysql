# Reveal Java Server (MySQL sample)

This folder contains a sample Reveal SDK server implemented with Spring Boot that demonstrates integrating Reveal with a MySQL data source.


Important endpoints (when running locally on default port 5111):

- Dashboards list (names): http://localhost:5111/dashboards/names
- Visualizations list:     http://localhost:5111/dashboards/visualizations

---

## What's in this folder

- `pom.xml` - Maven project file (includes the Reveal SDK dependency and repository).
- `src/main/java` - Java source code (server implementation, providers, and configuration).
- `src/main/resources/application.properties.example` - Example configuration (copy to `application.properties`).
- `dashboards/` - Example .rdash dashboard files used by the sample client pages.

---

## Requirements

- Java 17+ (project uses Java 17 in `pom.xml`).
- Maven 3.6+ (or use the included `mvnw` wrapper on macOS/Linux).

---

## Quick start

1. Copy the example configuration and set your MySQL connection:

   - Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties` and update the `mysql.*` properties (host, database, username, password, port, schema).

2. Build the project:

   - Using the wrapper:

     ./mvnw -f server/java/pom.xml clean package

   - Or with an installed Maven:

     mvn -f server/java/pom.xml clean package

3. Run the app (dev):

   - Using the wrapper:

     ./mvnw -f server/java spring-boot:run

   - Or with Maven:

     mvn -f server/java spring-boot:run

   The server will start on the port configured in `application.properties` (default 5111).

4. Verify the endpoints:

   - http://localhost:5111/dashboards/names
   - http://localhost:5111/dashboards/visualizations

---

## Configuration

The project uses Spring Boot configuration keys. Copy and update `application.properties.example` to `application.properties` and set the following values:

- `server.port` - Port to run the server (default in example: 5111)
- `mysql.host` - MySQL server host
- `mysql.database` - Database name
- `mysql.username` - Database username
- `mysql.password` - Database password
- `mysql.port` - MySQL port (optional)
- `mysql.schema` - Database schema (optional)

Static images are served from `classpath:/static/images/` by default (see `application.properties.example`).

---

## Reveal SDK dependency

This project consumes the Reveal SDK Maven package from Reveal's Maven repository, declared in `pom.xml`:

- GroupId: `com.infragistics.reveal.sdk`
- ArtifactId: `reveal-sdk`
- Version: `1.8.0`

The repository URL is `https://maven.revealbi.io/repository/public`.

---

## Integrating with the client samples

The repository contains simple client examples in the `client/` folder (HTML pages). Point those pages to this server's base URL (for example `http://localhost:5111`) to load dashboards from this Java server.

See `client/index.html`, `client/index-ds.html`, and `client/load-dashboard.html` for usage examples.

---

## Useful links

- Reveal documentation: https://help.revealbi.io/web/
- Reveal JavaScript API: https://help.revealbi.io/api/javascript/latest/
- Reveal SDK GitHub: https://github.com/RevealBi/Reveal.Sdk

---

## Troubleshooting

- If Maven cannot resolve the `reveal-sdk` dependency, ensure the repository `https://maven.revealbi.io/repository/public` is reachable from your network.
- Check that your MySQL credentials and network allow the server to connect to the configured database. The sample expects the MySQL database to contain the same schema/data the dashboards reference.

---

If you want, I can also add a short example `application.properties` with safe placeholder values and/or a small script to run the server with the wrapper. Tell me which you'd prefer.
