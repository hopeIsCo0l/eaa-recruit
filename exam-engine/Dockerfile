# ── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/exam-engine ./cmd/server

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM alpine:3.20 AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app && apk add --no-cache ca-certificates
COPY --from=build /out/exam-engine /app/exam-engine

USER app
EXPOSE 8090

ENTRYPOINT ["/app/exam-engine"]
