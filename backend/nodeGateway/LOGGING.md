# Request Logging - Morgan

## Overview

The backend now includes **Morgan** HTTP request logger middleware. This automatically logs all incoming requests to the console with colored output.

## Installation

Morgan has been added to the project dependencies:
- `morgan@^1.10.1` - HTTP request logger middleware
- `@types/morgan@^1.9.10` - TypeScript definitions

## Configuration

**File:** `src/index.ts`

```typescript
import morgan from "morgan";

// Middleware
app.use(morgan("dev")); // Request logging
```

## Log Format

The backend uses the **'dev'** format, which provides colored output optimized for development:

```
METHOD /path STATUS response-time ms - content-length
```

### Example Output

```bash
POST /auth/signup 201 145.234 ms - 189
POST /auth/signin 200 98.567 ms - 178
POST /auth/refresh 401 2.345 ms - 34
POST /chat 200 1523.789 ms - 456
GET /auth/refresh 200 12.456 ms - 89
```

### Color Coding (in terminal)

- **Green**: 2xx Success responses
- **Yellow**: 3xx Redirection responses
- **Red**: 4xx Client errors
- **Red**: 5xx Server errors

## Log Details

Each log entry includes:

| Field | Description |
|-------|-------------|
| **METHOD** | HTTP method (GET, POST, PUT, DELETE, etc.) |
| **PATH** | Request URL path |
| **STATUS** | HTTP status code (200, 401, 404, 500, etc.) |
| **TIME** | Response time in milliseconds |
| **SIZE** | Response content length in bytes |

## Benefits

✅ **Instant visibility** - See every request as it happens  
✅ **Performance monitoring** - Track response times  
✅ **Debugging** - Quickly identify failing endpoints  
✅ **API usage tracking** - Monitor which endpoints are being hit  
✅ **Error detection** - Red-colored 4xx/5xx errors stand out  

## Available Formats

Morgan supports multiple predefined formats:

| Format | Description |
|--------|-------------|
| `dev` | Concise colored output for development (current) |
| `combined` | Standard Apache combined log format |
| `common` | Standard Apache common log format |
| `short` | Shorter than default, includes response time |
| `tiny` | Minimal output |

### Switching Formats

To change the log format, edit `src/index.ts`:

```typescript
app.use(morgan("combined")); // Apache combined format
app.use(morgan("tiny"));     // Minimal output
```

## Advanced Configuration

### Skip Certain Routes

Skip logging for health check endpoints:

```typescript
app.use(morgan("dev", {
  skip: (req, res) => req.url === "/health"
}));
```

### Custom Tokens

Add custom information to logs (e.g., authenticated user):

```typescript
// Define custom token
morgan.token('user', (req: any) => req.userId || 'anonymous');

// Use in format
app.use(morgan(':method :url :status :response-time ms - :user'));
```

### Log to File (Production)

Write logs to a file instead of console:

```typescript
import fs from 'fs';
import path from 'path';

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' } // append mode
);

app.use(morgan('combined', { stream: accessLogStream }));
```

### Dual Logging (Console + File)

Log to both console and file:

```typescript
// Console logging (dev format)
app.use(morgan('dev'));

// File logging (combined format)
app.use(morgan('combined', { stream: accessLogStream }));
```

## Environment-Based Logging

Different formats for development vs production:

```typescript
const logFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';

app.use(morgan(logFormat));
```

## Troubleshooting

### Logs not appearing?

1. **Check middleware order**: Morgan must be registered BEFORE routes
   ```typescript
   app.use(morgan('dev'));  // ✅ Before routes
   app.use('/auth', authRoutes);
   ```

2. **Verify morgan import**: Check the import statement
   ```typescript
   import morgan from "morgan";
   ```

3. **Check console output**: Ensure your terminal shows the server running

### Too verbose?

Switch to 'tiny' format for minimal output:
```typescript
app.use(morgan('tiny'));
```

### Want structured logs?

Consider using **pino-http** for JSON-formatted logs:
```bash
bun add pino pino-http
```

## Morgan Tokens Reference

Common tokens you can use in custom formats:

- `:method` - HTTP method
- `:url` - Request URL
- `:status` - Response status code
- `:response-time` - Response time in ms
- `:res[content-length]` - Response size
- `:remote-addr` - Client IP address
- `:http-version` - HTTP version
- `:user-agent` - Client user agent
- `:date[format]` - Current date/time
- `:referrer` - Request referrer

### Example Custom Format

```typescript
app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :user-agent'));
```

Output:
```
POST /auth/signin 200 45.123 ms - 189 - Mozilla/5.0...
```

## Documentation

- Morgan GitHub: https://github.com/expressjs/morgan
- NPM Package: https://www.npmjs.com/package/morgan
- Express Middleware Guide: https://expressjs.com/en/guide/using-middleware.html
