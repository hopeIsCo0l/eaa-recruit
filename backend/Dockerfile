# ── Build stage ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:23-jdk-alpine AS build
WORKDIR /workspace

COPY gradle/ gradle/
COPY gradlew gradle.properties settings.gradle build.gradle ./
RUN chmod +x gradlew && ./gradlew --version --no-daemon

COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM eclipse-temurin:23-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/build/libs/*.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
