# ── Build stage ──────────────────────────────────────────────────────────────
# Use the pre-packaged Gradle image — avoids the wrapper downloading gradle-8.13-bin.zip
# which times out due to the wrapper's hardcoded 10s socket timeout.
FROM gradle:8.13-jdk21-alpine AS build
WORKDIR /workspace

COPY settings.gradle build.gradle ./
RUN gradle dependencies --no-daemon -q

COPY src/ src/
RUN gradle bootJar --no-daemon -x test

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/cv-uploads /app/xai-reports \
    && chown -R app:app /app
COPY --from=build /workspace/build/libs/*.jar app.jar
RUN chown app:app /app/app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
