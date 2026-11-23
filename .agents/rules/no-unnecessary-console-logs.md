# Rule: Prohibition of Unnecessary Console Logs in Production

## Description
Prevent information disclosure, security vulnerabilities, and memory leaks by forbidding unnecessary `console.log`, `console.info`, `console.debug`, and verbose `console.dir` statements across all production code.

## Guidelines
1. **Never commit debugging logs:**
   - Remove all temporary `console.log` statements used during development or debugging.
2. **Never log sensitive data:**
   - Under no circumstances log passwords, tokens, full user profile records, payment transaction details, or student PII.
3. **Frontend error handling:**
   - Handle client-side errors via user-facing error state (banners, modals, input error messages) rather than writing error stack traces to `console.log`.
4. **Backend logging:**
   - Server-side logging must be restricted to centralized error middleware (`globalErrorHandler`) and server lifecycle messages. Scrub all credentials and tokens before logging.
