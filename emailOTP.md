# Email OTP Implementation Guide — EAA Recruit

A step-by-step guide for implementing email OTP verification **inside the existing EAA Recruit repository**. This is not a tutorial for a fresh project — it adapts standard OTP patterns to this repo's conventions: **Gradle, `application.yml`, Docker Compose, and the existing `com.eaa.recruit.otp` package**.

> **Before you start**: Skim the generic tutorial first for the conceptual flow. Then use this guide for the actual implementation. Whenever there's a conflict, **this guide wins** — the generic tutorial assumes a fresh project and does not fit this repo.

---

## Table of Contents

1. [Repo Conventions You Must Follow](#repo-conventions-you-must-follow)
2. [Phase 1: Inventory the Existing Code](#phase-1-inventory-the-existing-code)
3. [Phase 2: Gmail App Password Setup](#phase-2-gmail-app-password-setup)
4. [Phase 3: Docker Compose — Add Redis Service](#phase-3-docker-compose--add-redis-service)
5. [Phase 4: Gradle Dependencies](#phase-4-gradle-dependencies)
6. [Phase 5: `application.yml` Configuration](#phase-5-applicationyml-configuration)
7. [Phase 6: Environment Variables](#phase-6-environment-variables)
8. [Phase 7: Verify the Port Interface](#phase-7-verify-the-port-interface)
9. [Phase 8: Verify the Mock Adapter](#phase-8-verify-the-mock-adapter)
10. [Phase 9: Verify the SMTP Adapter](#phase-9-verify-the-smtp-adapter)
11. [Phase 10: Verify `OtpCacheService`](#phase-10-verify-otpcacheservice)
12. [Phase 11: Verify `OtpService`](#phase-11-verify-otpservice)
13. [Phase 12: Verify the Registration Endpoint](#phase-12-verify-the-registration-endpoint)
14. [Phase 13: Frontend Integration (Next.js)](#phase-13-frontend-integration-nextjs)
15. [Phase 14: Run the Full Stack](#phase-14-run-the-full-stack)
16. [Phase 15: End-to-End Testing](#phase-15-end-to-end-testing)
17. [Troubleshooting in a Docker Stack](#troubleshooting-in-a-docker-stack)
18. [Production Checklist](#production-checklist)

---

## Repo Conventions You Must Follow

Anything that contradicts these is wrong for this repo:

| Convention | Source of truth |
|---|---|
| **Build tool**: Gradle | `backend/build.gradle` |
| **Config format**: YAML | `backend/src/main/resources/application.yml` |
| **Run via**: Docker Compose | `docker-compose.yml` |
| **Package root**: `com.eaa.recruit` | Existing Java sources |
| **OTP package**: `com.eaa.recruit.otp` | Existing OTP module |
| **Frontend**: existing Next.js app | `frontend/` directory |
| **No new services** | Add to existing services, don't spin up new ones |

> **Rule of thumb**: If the generic tutorial says "create a new project" or "add to `pom.xml`", ignore that step and adapt the concept to fit what's already here.

---

## Phase 1: Inventory the Existing Code

Before writing anything, you need to know exactly what's already implemented and what's missing. Open these files and read them end to end:

### Required reading

```
backend/build.gradle
backend/src/main/resources/application.yml
docker-compose.yml
backend/src/main/java/com/eaa/recruit/otp/OtpService.java
backend/src/main/java/com/eaa/recruit/otp/OtpCacheService.java
backend/src/main/java/com/eaa/recruit/otp/OtpNotificationPort.java
backend/src/main/java/com/eaa/recruit/otp/SmtpOtpNotificationAdapter.java
backend/src/main/java/com/eaa/recruit/otp/MockOtpNotificationAdapter.java
```

### Checklist while reading

For each existing class, answer:

- [ ] Does it compile right now?
- [ ] Is it wired up via `@Service`, `@Component`, or similar?
- [ ] Are there `TODO` comments left over?
- [ ] Is there a registration controller that actually calls `OtpService`?
- [ ] Does the SMTP adapter actually use `JavaMailSender`, or is it stubbed?
- [ ] Is the mock adapter guarded by `@ConditionalOnProperty` or `@Profile`?

### Likely outcome

For most student/in-progress repos, you'll find:

- Class skeletons exist
- Some methods are stubs (`throw new UnsupportedOperationException(...)` or empty bodies)
- The controller exists but doesn't call `OtpService.generateAndSend(...)`
- The SMTP adapter compiles but isn't wired
- The mock adapter is the default

> **Save your inventory** as a short note. You'll refer to it in every phase below.

---

## Phase 2: Gmail App Password Setup

This part is identical to any standard OTP implementation. No repo-specific adaptation needed.

### Steps

1. Use a **dedicated Gmail account** (not your personal account). For this project, something like `eaa-recruit-noreply@gmail.com`.
2. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
3. Enable **2-Step Verification** (mandatory before App Passwords are available)
4. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
5. Name it `EAA Recruit Backend`, click **Create**
6. Copy the **16-character password** (looks like `abcd efgh ijkl mnop`) — Google only shows it once
7. Strip spaces and save it as an environment variable (next phase)

### Verify SMTP reachability

```bash
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

If the connection succeeds and you see an SMTP greeting, Gmail SMTP is reachable from your machine. Press `Ctrl+C` to exit.

---

## Phase 3: Docker Compose — Add Redis Service

The repo already runs as a Docker Compose stack, so Redis must be a service inside that stack, not a process on your host machine.

### Step 3.1: Open `docker-compose.yml`

You'll likely see services like `backend`, `frontend`, `postgres`, etc.

### Step 3.2: Add a Redis service

Add this to the `services:` block (keep the version directive and other services as they are):

```yaml
  redis:
    image: redis:7-alpine
    container_name: eaa-recruit-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - eaa-network  # use whatever network name the repo already defines
```

### Step 3.3: Add the volume

At the bottom of the file, in the `volumes:` block:

```yaml
volumes:
  redis-data:
  # ...other existing volumes
```

### Step 3.4: Make `backend` depend on Redis

In the `backend` service definition, add:

```yaml
  backend:
    # ...existing config...
    depends_on:
      redis:
        condition: service_healthy
      # ...other existing dependencies
```

### Step 3.5: Verify the network

Both `backend` and `redis` must be on the same Docker network. If the repo uses a named network (e.g., `eaa-network`), both services must declare it. If services use the default network, no change needed.

### Step 3.6: Bring up Redis only (to test)

```bash
docker compose up -d redis
docker compose exec redis redis-cli ping
```

Expected output: `PONG`

> **Important**: From inside the `backend` container, Redis is reachable at hostname `redis` (the service name), **not** `localhost`. This is the most common Docker Compose mistake. Your `application.yml` must reflect this.

---

## Phase 4: Gradle Dependencies

Open `backend/build.gradle` and check what's already declared in the `dependencies` block.

### Required dependencies for OTP flow

```groovy
dependencies {
    // Likely already present
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // Required for OTP — verify these are present
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-mail'

    // Lombok (likely already present)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

### Add only what's missing

Do **not** copy-paste the whole block — diff against the existing `build.gradle` and add only what isn't there. The Spring Boot version is set by the existing `plugins` block; don't override it.

### Apply changes

```bash
# Inside the backend directory on your host
./gradlew build --refresh-dependencies

# Or via Docker Compose
docker compose build backend
```

If the build succeeds, dependencies are correctly wired.

---

## Phase 5: `application.yml` Configuration

Open `backend/src/main/resources/application.yml`. Add or update these sections — preserving existing structure (don't flatten nested YAML into properties syntax).

### Step 5.1: Mail config

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

### Step 5.2: Redis config

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:redis}
      port: ${REDIS_PORT:6379}
      timeout: 2000ms
```

> **Note the default `redis`**, not `localhost`. The backend runs in a container; `localhost` inside the container is the container itself, not your host. Default to the Docker service name.

### Step 5.3: App-specific OTP config

```yaml
app:
  otp:
    mode: ${OTP_MODE:mock}   # "mock" for dev/test, "smtp" for real emails
    length: 6
    expiry-minutes: 10
    rate-limit-seconds: 60
```

### Step 5.4: Profiles (optional but recommended)

If the repo uses Spring profiles, override per environment:

`application-dev.yml`:
```yaml
app:
  otp:
    mode: mock
```

`application-prod.yml`:
```yaml
app:
  otp:
    mode: smtp
```

Activate via `SPRING_PROFILES_ACTIVE` env var in `docker-compose.yml`.

---

## Phase 6: Environment Variables

Never commit Gmail credentials. Use a `.env` file (which should be in `.gitignore`).

### Step 6.1: Create `.env` at the repo root

```bash
# Gmail SMTP
MAIL_USERNAME=eaa-recruit-noreply@gmail.com
MAIL_PASSWORD=abcdefghijklmnop

# Redis (use service name when in Docker Compose)
REDIS_HOST=redis
REDIS_PORT=6379

# OTP mode: "mock" or "smtp"
OTP_MODE=mock
```

### Step 6.2: Reference these in `docker-compose.yml`

```yaml
  backend:
    # ...existing config...
    environment:
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      REDIS_HOST: ${REDIS_HOST:-redis}
      REDIS_PORT: ${REDIS_PORT:-6379}
      OTP_MODE: ${OTP_MODE:-mock}
      # ...other existing env vars
```

### Step 6.3: Confirm `.env` is git-ignored

```bash
grep -E '^\.env$' .gitignore
```

If nothing returns, add `.env` to `.gitignore` immediately.

### Step 6.4: Create `.env.example` for the repo

```bash
# Copy without the real values
cp .env .env.example
# Then replace real values with placeholders
```

Commit `.env.example` so other developers know what variables are needed.

---

## Phase 7: Verify the Port Interface

Open `backend/src/main/java/com/eaa/recruit/otp/OtpNotificationPort.java`.

### What it should look like

```java
package com.eaa.recruit.otp;

public interface OtpNotificationPort {
    void sendOtp(String recipient, String otp);
}
```

### Checklist

- [ ] Method signature uses primitive `String` types (not custom DTOs)
- [ ] Lives in `com.eaa.recruit.otp` (not a sub-package, unless the repo has one)
- [ ] No business logic — interface only
- [ ] No imports of Spring-specific types (it's a pure port)

If the existing port deviates, **adapt to it** — don't rename or move it. Whatever method name the existing service code calls, that's the contract.

---

## Phase 8: Verify the Mock Adapter

Open `backend/src/main/java/com/eaa/recruit/otp/MockOtpNotificationAdapter.java`.

### What it should do

```java
package com.eaa.recruit.otp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.otp.mode", havingValue = "mock", matchIfMissing = true)
public class MockOtpNotificationAdapter implements OtpNotificationPort {

    @Override
    public void sendOtp(String recipient, String otp) {
        log.info("===== MOCK OTP =====");
        log.info("  To:  {}", recipient);
        log.info("  OTP: {}", otp);
        log.info("====================");
    }
}
```

### Checklist

- [ ] Has `@Component` (or equivalent) so Spring picks it up
- [ ] Has `@ConditionalOnProperty` matching `app.otp.mode=mock`
- [ ] Uses `@Slf4j` and `log.info` (don't `System.out.println`)
- [ ] **Logs the OTP for debugging** — this is the whole point of the mock
- [ ] `matchIfMissing = true` so dev environments default to mock (recommended but optional)

> **If the mock adapter is missing entirely**, create it using the snippet above. It's the most important class for development — without it, you can't test without setting up Gmail.

---

## Phase 9: Verify the SMTP Adapter

Open `backend/src/main/java/com/eaa/recruit/otp/SmtpOtpNotificationAdapter.java`.

### What it should do

```java
package com.eaa.recruit.otp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.otp.mode", havingValue = "smtp")
public class SmtpOtpNotificationAdapter implements OtpNotificationPort {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Override
    public void sendOtp(String recipient, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject("Verify your email — EAA Recruit");
            message.setText(buildBody(otp));
            mailSender.send(message);
            log.info("OTP email sent to {}", recipient);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", recipient, e);
            throw new OtpDeliveryException("Email delivery failed", e);
        }
    }

    private String buildBody(String otp) {
        return """
                Welcome to EAA Recruit.

                Your verification code is:

                    %s

                This code expires in 10 minutes.
                If you didn't request this, please ignore this email.
                """.formatted(otp);
    }
}
```

### Checklist

- [ ] Constructor-injects `JavaMailSender` (`@RequiredArgsConstructor` from Lombok, or manual)
- [ ] Has `@ConditionalOnProperty` for `app.otp.mode=smtp` so only one adapter is active
- [ ] **Catches exceptions and wraps them** — never let raw `MailException` bubble up
- [ ] Reads sender address from config, not hardcoded
- [ ] `OtpDeliveryException` exists somewhere in this package (create it if missing)

### If `OtpDeliveryException` doesn't exist

Create `backend/src/main/java/com/eaa/recruit/otp/OtpDeliveryException.java`:

```java
package com.eaa.recruit.otp;

public class OtpDeliveryException extends RuntimeException {
    public OtpDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

---

## Phase 10: Verify `OtpCacheService`

Open `backend/src/main/java/com/eaa/recruit/otp/OtpCacheService.java`.

### What it should do

```java
package com.eaa.recruit.otp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpCacheService {

    private static final String KEY_PREFIX = "otp:candidate:";

    private final StringRedisTemplate redisTemplate;

    @Value("${app.otp.expiry-minutes:10}")
    private int expiryMinutes;

    public void saveOtp(String email, String otp) {
        redisTemplate.opsForValue().set(
            buildKey(email),
            otp,
            Duration.ofMinutes(expiryMinutes)
        );
    }

    public String getOtp(String email) {
        return redisTemplate.opsForValue().get(buildKey(email));
    }

    public void deleteOtp(String email) {
        redisTemplate.delete(buildKey(email));
    }

    private String buildKey(String email) {
        return KEY_PREFIX + email.toLowerCase().trim();
    }
}
```

### Checklist

- [ ] Uses `StringRedisTemplate` (preferred for string-only data — no serialization config needed)
- [ ] Key prefix is consistent (`otp:candidate:` or whatever the repo uses)
- [ ] Expiry is read from config, not hardcoded
- [ ] Email is normalized (lowercase, trim) before being used as a key
- [ ] TTL is set in the same call as the value (`set(...)` with `Duration` arg)

> **Common bug**: Using `RedisTemplate<String, Object>` with default serializers makes keys look like binary garbage in `redis-cli`. Switch to `StringRedisTemplate` if the existing class has serialization issues.

---

## Phase 11: Verify `OtpService`

Open `backend/src/main/java/com/eaa/recruit/otp/OtpService.java` — the file your inventory called out as needing the most attention.

### What it should do

```java
package com.eaa.recruit.otp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final SecureRandom random = new SecureRandom();
    private final OtpCacheService cacheService;
    private final OtpNotificationPort notificationPort;

    @Value("${app.otp.length:6}")
    private int otpLength;

    public void generateAndSend(String email) {
        String otp = generateOtp();
        cacheService.saveOtp(email, otp);

        try {
            notificationPort.sendOtp(email, otp);
        } catch (Exception e) {
            cacheService.deleteOtp(email);  // rollback on send failure
            throw e;
        }

        log.info("OTP generated and dispatched for {}", email);
    }

    public boolean verify(String email, String submittedOtp) {
        String stored = cacheService.getOtp(email);
        if (stored == null) return false;
        if (!constantTimeEquals(stored, submittedOtp)) return false;

        cacheService.deleteOtp(email);  // one-time use
        return true;
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, otpLength);
        return String.format("%0" + otpLength + "d", random.nextInt(bound));
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
```

### Checklist

- [ ] Method names match what the controller calls (`generateAndSend`, `verify`, or whatever the existing API expects)
- [ ] OTP is **always saved before sent** (so failed sends can be rolled back)
- [ ] Failed sends **delete the cached OTP** to keep state consistent
- [ ] Verification uses **constant-time comparison** (prevents timing attacks)
- [ ] Successful verification **deletes the OTP** (one-time use)
- [ ] Uses `SecureRandom`, not `Random` or `Math.random()`
- [ ] OTP length is configurable

### Common issues to look for

- Method body throws `UnsupportedOperationException` → fully unimplemented
- Method calls `notificationPort.sendOtp` but never saves to Redis → OTP can never be verified
- Method saves to Redis but never sends → user never gets the code
- Verification uses `.equals()` directly → vulnerable to timing attacks (low risk but easy to fix)
- Verification doesn't delete after success → OTP reusable

---

## Phase 12: Verify the Registration Endpoint

Locate the registration controller. Likely paths:

```
backend/src/main/java/com/eaa/recruit/auth/AuthController.java
backend/src/main/java/com/eaa/recruit/candidate/CandidateController.java
backend/src/main/java/com/eaa/recruit/registration/RegistrationController.java
```

### What the endpoint should do

```java
@PostMapping("/api/v1/auth/register/candidate")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    String email = request.getEmail().toLowerCase().trim();

    // 1. Check for existing user (your existing logic)
    if (userRepository.existsByEmail(email)) {
        return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
    }

    // 2. Rate limit
    if (!rateLimiter.canRequestOtp(email)) {
        long retryAfter = rateLimiter.getRetryAfterSeconds(email);
        return ResponseEntity.status(429).body(Map.of(
            "error", "Too many requests",
            "retryAfter", retryAfter
        ));
    }

    // 3. Store pending registration (this part is repo-specific)
    pendingRegistrationService.savePending(email, request);

    // 4. Generate and send OTP
    try {
        otpService.generateAndSend(email);
    } catch (OtpDeliveryException e) {
        log.error("OTP delivery failed for {}", email, e);
        return ResponseEntity.status(503).body(Map.of(
            "error", "Could not send verification email. Please try again."
        ));
    } catch (Exception e) {
        log.error("Unexpected error during registration for {}", email, e);
        return ResponseEntity.status(503).body(Map.of(
            "error", "Service temporarily unavailable."
        ));
    }

    return ResponseEntity.status(201).body(Map.of(
        "message", "Verification email sent",
        "email", email
    ));
}
```

### Critical checks

- [ ] Returns **503**, not 500, on OTP/Redis/SMTP failures (so users know to retry, not that their input is wrong)
- [ ] Returns **409** for duplicate email, **422** for invalid input, **429** for rate limits
- [ ] Stores pending registration data (name, hashed password) somewhere **before** sending OTP — otherwise you have no data to use after verification
- [ ] **Never returns the OTP** in the response
- [ ] **Never logs the OTP**

### Why pending registration matters

The tutorial glosses over this, but it's critical: when the user verifies the OTP, you need their original registration data (name, password, etc.) to create the account. Options:

1. **Store pending registration in Redis** (recommended) — same TTL as OTP
2. **Store in a `pending_registrations` database table** with TTL
3. **Have the frontend resubmit registration data with the OTP** (less secure — frontend could tamper)

Whatever the repo uses, make sure it works. If nothing exists, add Redis-backed pending registration:

```java
@Service
@RequiredArgsConstructor
public class PendingRegistrationService {
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public void savePending(String email, RegisterRequest req) throws Exception {
        String key = "pending-reg:" + email.toLowerCase();
        redis.opsForValue().set(key, objectMapper.writeValueAsString(req), Duration.ofMinutes(15));
    }

    public RegisterRequest getPending(String email) throws Exception {
        String key = "pending-reg:" + email.toLowerCase();
        String json = redis.opsForValue().get(key);
        return json == null ? null : objectMapper.readValue(json, RegisterRequest.class);
    }

    public void clearPending(String email) {
        redis.delete("pending-reg:" + email.toLowerCase());
    }
}
```

---

## Phase 13: Frontend Integration (Next.js)

The frontend already exists. Don't create a new Next.js project.

### Step 13.1: Find the existing registration page

Likely paths:

```
frontend/src/app/register/page.tsx
frontend/src/app/auth/register/page.tsx
frontend/src/pages/register.tsx
```

### Step 13.2: Find or create the verify-OTP page

If it doesn't exist, mirror the directory of the registration page:

```
frontend/src/app/verify-otp/page.tsx
```

### Step 13.3: Match the existing API client

Check how other API calls are made in the repo. Likely candidates:

- A shared `lib/api.ts` or `services/api.ts` using `axios` or `fetch`
- A custom hook like `useApi()` or `useAuth()`
- React Query / SWR setup

**Use whatever pattern already exists.** Don't introduce a new HTTP client.

### Step 13.4: Backend URL inside Docker Compose

Inside the Docker network, the frontend (server-side rendering) talks to backend at the **service name**, not localhost:

```
http://backend:8080/api/v1/auth/register/candidate
```

But the browser (client-side) talks to the backend through the **exposed port**:

```
http://localhost:8080/api/v1/auth/register/candidate
```

If the repo uses Next.js API routes as a proxy, only the server-side URL matters. If it makes direct browser requests, use `NEXT_PUBLIC_API_URL=http://localhost:8080`.

### Step 13.5: OTP input UI pattern

If the existing frontend has form components, use them. Otherwise, a six-input pattern with auto-focus:

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('pendingEmail');
    if (!saved) router.push('/register');
    else setEmail(saved);
  }, [router]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const code = otp.join('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Verification failed');
      }

      sessionStorage.removeItem('pendingEmail');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Verify your email</h1>
      <p>Code sent to <strong>{email}</strong></p>
      <form onSubmit={handleVerify}>
        <div style={{ display: 'flex', gap: 8 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          ))}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading || otp.some((d) => !d)}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
```

Style with whatever styling system the repo uses (Tailwind, CSS modules, styled-components, etc.).

---

## Phase 14: Run the Full Stack

```bash
# From the repo root
docker compose up --build
```

Watch the logs for:

```
backend       | Started Application in X seconds
backend       | Tomcat started on port 8080
redis         | Ready to accept connections
frontend      | ready - started server on 0.0.0.0:3000
```

If any service fails to start, the logs will say why. Most common: the backend can't reach Redis (wrong hostname, network mismatch).

---

## Phase 15: End-to-End Testing

### Test 1: Mock adapter flow (no real email)

1. Confirm `OTP_MODE=mock` in `.env`
2. Open `http://localhost:3000/register`
3. Submit the form
4. Tail backend logs:
   ```bash
   docker compose logs -f backend | grep "MOCK OTP"
   ```
5. Copy the OTP from logs
6. Enter it on the verify page
7. Should redirect to dashboard

### Test 2: Inspect Redis directly

```bash
docker compose exec redis redis-cli
> KEYS otp:*
> GET otp:candidate:test@example.com
> TTL otp:candidate:test@example.com
> exit
```

You should see the OTP and a TTL between 0 and 600 seconds.

### Test 3: Switch to real SMTP

1. Change `.env`:
   ```
   OTP_MODE=smtp
   ```
2. Restart the backend only:
   ```bash
   docker compose restart backend
   ```
3. Register with a real email address
4. Check inbox (and spam)

### Test 4: Failure paths

Try each of these and verify the response code:

| Scenario | Expected response |
|---|---|
| Register same email twice quickly | 429 (rate limited) |
| Register with `notanemail` | 422 (validation) |
| Register an email already in DB | 409 (conflict) |
| Verify with wrong OTP | 401 |
| Verify after 11 minutes | 401 (expired) |
| Verify with no Redis (`docker compose stop redis`) | 503 |

If any of these return 500, the error handling needs work.

---

## Troubleshooting in a Docker Stack

### Backend can't connect to Redis

Symptom: `Unable to connect to Redis` in backend logs.

Causes:
- `application.yml` uses `localhost` instead of `redis`
- Backend and Redis aren't on the same Docker network
- Redis container is unhealthy or not started

Fix:
```bash
docker compose ps                              # check Redis is "healthy"
docker compose exec backend ping redis         # should resolve
docker compose exec backend nc -zv redis 6379  # should connect
```

### Email never arrives, no errors in logs

Cause: SMTP adapter not active. The mock adapter is silently logging instead.

Fix:
```bash
docker compose exec backend env | grep OTP_MODE
# Should output: OTP_MODE=smtp
```

If it shows `mock`, your `.env` change didn't propagate. Run:
```bash
docker compose down
docker compose up -d
```

### Email never arrives, errors in logs

Look for the actual exception:
```bash
docker compose logs backend | grep -i "mail\|smtp" | tail -50
```

Common errors:
- `AuthenticationFailedException` → wrong App Password (or spaces left in it)
- `MailConnectException` → port blocked or wrong host
- `MailSendException: 550` → Gmail rejecting recipient (typo in email?)

### Frontend gets CORS errors

Cause: backend doesn't allow `http://localhost:3000` origin.

Fix: check `SecurityConfig.java` (or wherever security is configured in the repo). The CORS config must include `http://localhost:3000` and any production frontend domain.

### OTP works once, then never again

Cause: OTP is being deleted before verification or the cache isn't persisting.

Fix: check the order of operations in `OtpService.generateAndSend()`. The order must be: save to Redis → send email. If send fails, delete from Redis. Never delete during a successful send.

### `docker compose up` fails on the redis service

Check the volume:
```bash
docker volume ls | grep redis
docker volume rm <project>_redis-data  # if corrupted from a previous run
```

---

## Production Checklist

Before submitting the final project, verify:

### Configuration
- [ ] No secrets in committed code (search for `MAIL_PASSWORD`, `SECRET`, etc.)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is committed with placeholder values
- [ ] `application.yml` uses `${ENV_VAR}` references, not hardcoded values
- [ ] `OTP_MODE=smtp` in production, `mock` in dev

### Backend
- [ ] Both `MockOtpNotificationAdapter` and `SmtpOtpNotificationAdapter` exist and are correctly conditioned
- [ ] `OtpService` rolls back Redis on send failure
- [ ] `OtpService.verify()` uses constant-time comparison
- [ ] Successful verification deletes the OTP from Redis
- [ ] Controller returns appropriate status codes (409, 422, 429, 401, 503 — not 500 for known failures)
- [ ] Rate limiting is enforced on both register and resend endpoints
- [ ] Pending registration data is stored somewhere before OTP is sent

### Docker
- [ ] Redis service is healthchecked
- [ ] Backend `depends_on` Redis with `condition: service_healthy`
- [ ] Both services share the same network
- [ ] Backend env vars reference `redis` (service name), not `localhost`

### Frontend
- [ ] OTP verification page exists and matches existing UI patterns
- [ ] API calls use the existing HTTP client / patterns
- [ ] Error responses (429, 503, 401) show user-friendly messages
- [ ] Resend button has a cooldown timer

### Security
- [ ] HTTPS in production (not part of the OTP flow itself, but required)
- [ ] CORS restricted to known origins
- [ ] OTP is never logged or returned in API responses
- [ ] App Password is stored only in `.env` (and production secrets manager)

### Reliability
- [ ] Redis failure returns 503 to the user
- [ ] SMTP failure returns 503 to the user and rolls back the Redis state
- [ ] Connection timeouts are set on the mail sender (5 seconds is reasonable)

---

## What's Different from the Generic Tutorial

For quick reference, every step in the generic tutorial that **does not apply** to this repo:

| Generic tutorial step | Why it doesn't apply here |
|---|---|
| "Generate a new Spring Boot project at start.spring.io" | Project already exists |
| "Add to `pom.xml`" | Repo uses Gradle |
| Any `mvn` or `./mvnw` command | Repo uses `./gradlew` |
| `application.properties` syntax | Repo uses `application.yml` |
| "Install Redis locally with `brew install redis`" | Redis is a Docker Compose service |
| "Run Redis with `redis-server`" | `docker compose up redis` |
| "Connect to `localhost:6379` from the app" | Connect to `redis:6379` (service hostname) |
| Creating `SecurityConfig.java` from scratch | Likely already exists; update existing |
| Creating a new Next.js app with `create-next-app` | Frontend already exists |
| Standalone testing on host machine | Tests run inside Docker Compose stack |

---

## Final Notes

This guide assumed standard repo conventions for a Spring Boot + Docker Compose project. If you find something doesn't match the actual files in your repo:

1. **The repo wins.** Adapt this guide, not your codebase.
2. **Naming conventions matter.** If the existing code calls `OtpService.send(...)` instead of `generateAndSend(...)`, keep using `send(...)`. Don't rename existing methods.
3. **Don't introduce new patterns.** If the repo doesn't use Lombok, don't add `@Slf4j`. If it uses a different logger, follow that.

The conceptual flow — generate OTP, store in Redis with TTL, send via SMTP, verify and delete — is universal. The wiring is what's specific to this repo. Get the wiring right and the flow will follow.