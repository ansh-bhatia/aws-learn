// Messaging & Integration
export default {
  id: "messaging",
  label: "Messaging & Integration",
  icon: "📨",
  color: "#FF4F8B",
  topics: [
    {
      id: "api-gateway-waf-edge-protection",
      title: "API Gateway Layer 3 – WAF Edge Protection: Blocking Attacks Before the Request Even Reaches API Gateway",
      shortDesc: "WAF sits ahead of everything else in the security stack, filtering out malicious traffic at Layer 7 before API Gateway itself ever processes the request",
      visuals: [],
      content: `## ⚠️ WAF: The Highest Level of Protection, First in Line

> **Edge protection secures the API at the entry point — BEFORE any request reaches API Gateway at all.** ⚠️ **This is provided by AWS WAF (Web Application Firewall), operating at Layer 7 (the application layer of the OSI model)** — ⚠️ **explicitly called out as the "highest level of security" among API Gateway's four layers, since it filters traffic before API Gateway itself even processes anything.**

**⚠️ Attacks WAF protects against**: SQL injection, cross-site scripting (XSS), malicious IP addresses, and bad bots/automated attacks.

**⚠️ Exam tip called out directly**: "AWS WAF works at Layer 7 and blocks the request BEFORE API execution" — this exact phrasing is worth memorizing verbatim.

---

## Exam Framing

> "An API needs Layer 7 application-level protection against SQL injection and cross-site scripting attacks, filtering malicious traffic before it ever reaches API Gateway" → **AWS WAF integration** — the edge-protection layer, evaluated before API Gateway processes the request at all, distinct from resource policy (which controls origin) and the usage plan/authorizer layers (which run inside API Gateway itself, after WAF has already let the request through).
`,
    },
    {
      id: "api-gateway-iam-vs-cognito-vs-lambda-authorizer",
      title: "API Gateway Authentication – IAM vs Cognito vs Lambda Authorizer: Three Callers, Three Tools",
      shortDesc: "SigV4 signing in the question means IAM; social login or JWT tokens mean Cognito; a genuinely custom or legacy authentication scheme means Lambda authorizer — the exam keyword gives the answer away directly",
      visuals: [],
      content: `## Layer 4: Authentication and Authorization — Three Distinct Tools for Three Distinct Callers

> **Authentication decides WHO can access the API; authorization decides WHAT they're allowed to do once authenticated.** ⚠️ **API Gateway supports three tools for this, each suited to a different type of caller.**

---

## IAM: For AWS-to-AWS Access

> **Who uses it**: other AWS services or IAM users/roles — NOT end users with no AWS account. **Purpose**: securing AWS-to-AWS access. **Auth type**: AWS credentials (SigV4 signing). **Authorization**: via IAM policy. ⚠️ **Does NOT support OAuth 2.0, JWT tokens, social login (Google/Facebook), external identity providers, or custom authentication rules — none of these are available through IAM.** **Typical use case**: internal AWS-only APIs.

**⚠️ Exam keyword: "SigV4 signing" in a question → the answer is always IAM.**

---

## Cognito: For End Users (Web/Mobile)

> **Who uses it**: end users accessing the API from a web or mobile app — people with NO AWS account of their own. **Purpose**: authentication and authorization for public-facing APIs. **Auth type**: username/password, OR social login (Google, Facebook). **Authorization**: via Cognito User Pool. ⚠️ **Supports OAuth 2.0 — yes. JWT tokens — yes. Social login — yes, fully. External identity providers (e.g. connecting to an existing Active Directory) — yes, supported.** ⚠️ **Custom authentication rules: only LIMITED — Cognito has predefined rules, not full custom logic.** **Typical use case**: public APIs serving real end users.

**⚠️ Exam keyword: "OAuth" or "JWT token" in a question → the answer is Cognito.**

---

## Lambda Authorizer: For Fully Custom Logic

> **Who uses it**: anyone with a requirement not covered by IAM or Cognito's built-in rules. **Purpose**: fully custom authentication and authorization, written entirely as your own Lambda code. **Auth type**: custom token, header, query parameter — whatever the custom logic defines. **Authorization**: entirely handled by the Lambda function's own code. ⚠️ **OAuth, JWT, social login, external IDPs — ALL possible, but only if explicitly coded into the Lambda function; none of it comes built-in.** ⚠️ **Custom authentication rules: FULL control** — this is the entire point of choosing Lambda authorizer over the other two. **Typical use case**: legacy applications, external/non-standard authentication systems, genuinely bespoke logic.

**⚠️ Exam keyword: "custom authorizer" in a question → the answer is Lambda authorizer.**

---

## Exam Framing

> "An internal API is called only by other AWS services using SigV4-signed requests, with authorization managed through IAM policies" → **IAM.** "A public mobile app needs users to log in via Google or Facebook, using JWT tokens issued after login" → **Cognito.** "An API needs to authenticate against a legacy, non-AWS identity system with completely custom logic" → **Lambda authorizer** — the only option offering full, unrestricted control over the authentication logic itself. The three exam keywords to memorize directly: **SigV4 → IAM; OAuth/JWT → Cognito; custom authorizer → Lambda authorizer.**
`,
    },
    {
      id: "api-gateway-resource-policy",
      title: "API Gateway Resource Policy – The First Gate a Request Passes Through, and Why It's Not Authentication",
      shortDesc: "An API key alone can never restrict WHERE a request comes from — resource policy is the layer that finally can, and it's evaluated before WAF, before the usage plan, before any authorizer",
      visuals: [],
      content: `## What Resource Policy Actually Controls

> **A resource policy controls WHO is allowed to reach an API Gateway at all, and specifically FROM WHERE — a capability API keys structurally cannot provide** (per the earlier API key topic: keys never restrict location). ⚠️ **Resource policy operates at the API Gateway level, evaluated BEFORE the request ever reaches Lambda or any backend service.**

**Concrete controls it enables**: allow/deny specific IP addresses (e.g. only an office's IP range), restrict access to a specific VPC, or restrict access to a specific AWS account (or all accounts within an organization).

---

## ⚠️ The Real Evaluation Order of All Security Layers

> **When a client sends a request, it passes through the security layers in this exact sequence: Resource Policy FIRST → then WAF → then the usage plan (API key/throttling/quota) → then the authorizer (IAM/Cognito/Lambda).** ⚠️ **If resource policy denies the request, it is rejected immediately — none of the later layers (WAF, usage plan, authorizer) are ever even evaluated.** ⚠️ **Resource policy sits at the very top of the entire security stack.**

---

## ⚠️ Resource Policy Is NOT Authentication

> **A common misunderstanding worth explicitly correcting: resource policy does NOT identify a user, and it is NOT a form of authentication.** ⚠️ **It controls FROM WHOM (which IP, VPC, or AWS account) a request can originate — never WHO the specific individual caller is.** Authentication (username/password, tokens, identity) is a fundamentally different concern, handled by the authorizer layer instead.

**Structure**: written in JSON, following the same policy-document format as IAM policies, S3 bucket policies, and KMS key policies — a familiar pattern if those have already been worked with.

---

## ⚠️ Building the API's ARN for the Policy

> **The resource policy references the API's own ARN, which must be manually constructed — it's not directly visible anywhere in the console as a copyable field.** ⚠️ **Format: the fixed prefix "arn:aws:execute-api:" + region (e.g. ap-south-1) + account ID + the API's own ID** — all three variable segments must be filled in correctly for the policy to reference the right API.

---

## ⚠️ Worked Test: IP-Restricted Policy → 403 → Removing It → Success Again

> **Setting a resource policy allowing access only from one specific (deliberately mismatched) IP, then deploying the API**, causes subsequent requests from the actual testing machine to fail with: ⚠️ **"User: anonymous is not authorized" — 403 Forbidden.** ⚠️ **This is the SAME 403 code seen earlier for a missing API key — but here the underlying cause is completely different (IP mismatch at the resource-policy layer, evaluated before the API key was ever even checked).** Removing the policy and redeploying restores normal access.

**⚠️ Mandatory step reinforced again**: any resource policy change requires redeploying the API to the stage before it takes effect — the same pattern already established for method-level changes.

---

## Exam Framing

> "An API needs to be reachable only from a company's specific office IP range, regardless of whether callers have a valid API key" → **resource policy** — this is the ONLY layer that can restrict access by origin (IP/VPC/account); API keys cannot do this at all. "A request is rejected with a 403 error, but the API key being sent is definitely valid" → **check the resource policy** — a 403 can originate from either a missing/invalid API key OR a resource-policy denial (e.g. wrong source IP), and resource policy is evaluated FIRST, before the API key/usage plan layer is ever reached.
`,
    },
    {
      id: "api-gateway-api-key-usage-plan-lab-403-429",
      title: "API Keys and Usage Plans Lab – Two Exam-Critical Error Codes: 403 vs 429",
      shortDesc: "A missing key gets a 403; a valid key that's simply used too much gets a 429 — same overall goal of blocking the request, completely different reason, completely different code",
      visuals: [],
      content: `## The Five-Step Setup Process

1. **Create the API key** (auto-generated string, or a custom one requiring at least 20 characters).
2. **Create a usage plan** (initially with throttling/quota disabled, to test the key alone first).
3. **Associate the usage plan with the REST API's stage.**
4. **Associate the API key with the usage plan.**
5. **Enable "API key required" at the METHOD level — not globally across the whole API.**

⚠️ **Critical: enabling API key requirement is done PER METHOD, not per API.** In this lab, only the POST method has the key requirement enabled — the GET and DELETE methods on the same API continue working without any key at all. ⚠️ **Whenever any method setting changes, the API must be RE-DEPLOYED to the stage** — the change has no effect on live traffic until deployment happens again.

---

## ⚠️ Error 1: 403 Forbidden — No API Key Provided

> **Sending a request to a key-required method WITHOUT supplying the key returns a 403 Forbidden error.** ⚠️ **The fix: the API key must be sent as an HTTP HEADER — specifically the header named** \`x-api-key\` **, with the actual key string as its value.** ⚠️ **Both the exact header name (x-api-key) and the 403 error code for a missing/invalid key are called out as genuine exam-question material.**

---

## ⚠️ Error 2: 429 Too Many Requests — Quota or Throttle Exceeded

> **Once a valid API key is supplied and working, testing the usage plan's QUOTA** (e.g. setting it to 1 request per day, deliberately already exhausted) **produces a completely different error: 429 Too Many Requests, with a "limit exceeded" message.** ⚠️ **This is the SAME 429 code covered in the earlier theory topic for both throttling (rate/burst) and quota violations** — now confirmed hands-on. ⚠️ **The key distinction from 403: 403 means the request was never properly authenticated/authorized at all (missing or wrong key); 429 means the request WAS properly authenticated, but the client has simply used up its allowed usage.**

---

## Exam Framing

> "A request to an API-key-protected method fails with a 403 Forbidden error" → **the API key was missing or invalid — check that the request includes the** \`x-api-key\` **HTTP header with the correct key value.** "A request using a genuinely valid API key still gets rejected" → **check the usage plan's throttling (rate/burst) or quota settings — a 429 Too Many Requests error means the key is valid but the client has exceeded its allowed usage, a completely different failure mode from a 403.** Remember: **API key requirement is toggled per METHOD, not per API — and any method-level change requires redeploying the API to take effect.**
`,
    },
    {
      id: "api-gateway-security-layers-api-keys-usage-plans",
      title: "API Gateway's Four Security Layers, and Why an API Key Alone Does Absolutely Nothing",
      shortDesc: "An API key is just a password string with no concept of a username — it never proves WHO is calling, only that they happen to know a string, and it literally can't function without a usage plan attached",
      visuals: [],
      content: `## ⚠️ API Security Is Never One Feature — It's Four Independent Layers

> **Real-world API security is applied across MULTIPLE layers, each solving a different problem** (⚠️ **explicitly NOT the OSI networking layers — a separate concept entirely**):

1. **Usage control** — API keys and usage plans.
2. **Access control** — API Gateway resource policy.
3. **Edge protection** — AWS WAF.
4. **Authentication and authorization** — IAM, Cognito, Lambda authorizer.

This topic covers Layer 1. ⚠️ **WebSocket API is explicitly noted as out of scope for the Solutions Architect exam — these security features are asked about for REST/HTTP API specifically.**

---

## API Key: Just a Password String, Nothing More

> **An API key is a unique string identifying a calling client — sent with every request, checked by API Gateway before forwarding to the backend.** ⚠️ **Critical framing: it's just a password, with NO username concept at all** — one string value, verified as correct or not, with no identity attached to it.

**⚠️ An API key CANNOT function alone — it requires a Usage Plan to be associated with it, plus that usage plan must itself be associated with a stage.** Without a usage plan, an API key literally does nothing.

---

## Usage Plan: Two Configurable Controls

### Throttling — Controlling Request SPEED

> **Rate**: the average number of requests allowed per second, sustained continuously (e.g. rate=10 means 10 requests/second, indefinitely). **Burst**: ⚠️ **a TEMPORARY allowance above the rate limit, for short traffic spikes only — not sustained.** ⚠️ **Worked example: rate=10, burst=5 → a client can briefly send up to 15 requests at once, before settling back down to the sustained 10/second limit.** ⚠️ **Exceeding the throttling limits (rate + burst combined) returns a 429 "Too Many Requests" error.**

### Quota — Controlling Total VOLUME Over Time

> **Sets a hard cap on the total number of requests allowed over a period — per day, per week, or per month.** ⚠️ **Worked example: 1,000 requests per day — once the 1,000th request is made, the API stops accepting further requests from that key until the quota resets the next day.** ⚠️ **Exceeding the quota also returns a 429 error** — the same error code as throttling, just triggered by a different condition (total volume vs momentary speed).

---

## ⚠️ API Key's Real Limitations — Why More Layers Are Needed

> **API keys do NOT restrict WHERE a request comes from** — any client, from any country or data center, with the correct key string, is accepted. ⚠️ **API keys do NOT provide genuine user authentication** — there's no username, no identity, just a matching string; this is fundamentally different from something like a Google login. ⚠️ **API keys cannot block public internet access by themselves** — a public API remains reachable by anyone who obtains the key. ⚠️ **If a key leaks, it stays usable/misusable until it's explicitly rotated or disabled** — there's no automatic revocation mechanism tied to key exposure.

---

## ⚠️ Support Differences: REST API vs HTTP API

> **REST API fully supports API keys. HTTP API has only LIMITED API key support** — one more item in the ongoing REST-vs-HTTP feature-set tradeoff already established across earlier topics.

---

## Exam Framing

> "An API key alone is configured for a REST API, with no usage plan attached — does the key function?" → **no — an API key structurally cannot work without an associated usage plan (and that plan's stage association); the key alone does nothing.** "A client's requests suddenly spike well above the sustained rate limit for a few seconds, then return to normal" → **the burst setting is what determines whether this brief spike is tolerated or rejected** — burst allows temporary excess above the steady-state rate limit; exceeding rate+burst together returns a 429 error, the same code returned when a longer-term quota (daily/weekly/monthly) is exhausted.
`,
    },
    {
      id: "rest-api-lab-part4-testing-and-keep-resources",
      title: "REST API Lab – Part 4: Testing Complete, and Why Nothing Gets Deleted This Time",
      shortDesc: "Unlike the HTTP API lab where the gateway got deleted afterward, this REST API stays alive — the upcoming API key and usage plan labs are built directly on top of it",
      visuals: [],
      content: `## Testing Follows the Same Postman Pattern as the HTTP API Lab

> **The verification process mirrors the earlier HTTP API lab exactly**: POST to add a record (verified via DynamoDB refresh, response "user created successfully"), GET with a specific user ID to fetch it (record returned correctly), DELETE to remove it (verified via DynamoDB refresh showing the record gone). ⚠️ **The one structural difference: the invoke URL now includes the STAGE name** (e.g. .../dev/user) — a direct consequence of REST API's mandatory stage-deployment step from the earlier topic, which HTTP API's automatic default stage never required naming explicitly in the URL construction the same way.

---

## ⚠️ Critical Instruction: Do NOT Delete Anything This Time

> **Unlike the earlier HTTP API lab (where the API Gateway itself was deliberately deleted afterward, keeping only DynamoDB and Lambda), THIS REST API, its DynamoDB table, and its Lambda functions must ALL be kept.** ⚠️ **Upcoming labs — specifically API keys and usage plans — are built directly on top of THIS SAME REST API**, not a freshly created one. ⚠️ **None of these resources incur cost while idle** (Lambda bills only on invocation; an empty DynamoDB table has negligible RCU/WCU cost) — so keeping everything running between lab sessions is genuinely free.

---

## Exam Framing

> This lecture is primarily lab verification — the one concrete, non-repeated detail worth remembering is the ⚠️ **REST API invoke URL structure explicitly includes the stage name as part of the path** (base URL + stage + resource path, e.g. .../dev/user/101) — directly following from the mandatory stage-deployment requirement established in the previous lab part. Practically: whenever a REST API's resources are correctly configured but requests seem to fail, double-check the invoke URL actually includes the correct stage segment.
`,
    },
    {
      id: "rest-api-lab-part3-methods-and-stage-deployment",
      title: "REST API Lab – Part 3: No Invoke URL Exists Until You Deploy to a Stage — Manually",
      shortDesc: "HTTP API silently gives you a default stage for free; REST API forces you to create one explicitly and deploy to it before an invoke URL exists at all",
      visuals: [],
      content: `## ⚠️ Method, Not Route: One HTTP Method Per Lambda, Created Inside a Resource

> **Where HTTP API used flat "routes" mapped directly to integrations, REST API uses methods (matching the earlier resources-and-methods topic) — each HTTP method (GET, POST, DELETE) must be created SEPARATELY and mapped to its own Lambda function.** ⚠️ **Three Lambda functions → three separate methods, each created inside the correct resource**: POST inside /user (→ create-user function), GET inside /user/{userId} (→ get-user function), DELETE inside /user/{userId} (→ delete-user function). ⚠️ **Lambda proxy integration is enabled for all three**, matching the earlier proxy-integration topic's "let the powerful backend handle everything" pattern.

---

## ⚠️ The Critical New Step: Deploying to a Stage (Mandatory, Unlike HTTP API)

> **In HTTP API, a default stage is created automatically — no manual stage step was ever needed.** ⚠️ **REST API is different: a stage must be EXPLICITLY created, and the API must be deployed to it, before an invoke URL exists at all.** ⚠️ **Without this deployment step, there is simply no way to actually call the API** — all the resources and methods can be perfectly configured, but nothing is reachable until deployment happens.

**The deployment process**: click Deploy API → choose (or create) a stage name (e.g. "dev") → deploy → ⚠️ **API Gateway then generates the invoke URL, in the form of the base URL plus the stage name appended** (e.g. .../dev).

**⚠️ A practical quirk to expect**: the "Deploy API" button can appear grayed out while the API is still processing recent changes — it becomes clickable again once that background update finishes, not immediately after creating the last method.

---

## What Deployment Actually Activates

> **Once deployed, all three methods (POST, GET, DELETE) become genuinely active and callable** — this is the point where the API transitions from "fully configured" to "actually usable," ready for testing via Postman, a browser, or a real frontend.

---

## Exam Framing

> "A REST API's resources and methods are all fully configured, but attempting to call it returns no working URL at all" → **the API was never deployed to a stage** — unlike HTTP API's automatic default stage, REST API requires explicitly creating a stage and deploying the API to it before any invoke URL exists. "Why does HTTP API not require this manual stage-deployment step, while REST API does?" → **HTTP API automatically creates a default stage as part of its simpler, faster setup model; REST API's more explicit, feature-rich configuration model requires deployment to a stage as a deliberate, separate action.**
`,
    },
    {
      id: "rest-api-lab-part2-create-api-resources",
      title: "REST API Lab – Part 2: One Unique URL Path = One Resource, No Exceptions",
      shortDesc: "Needing both /user and /user/{userId} means creating TWO resources, not one — REST API's structure is deliberately one resource per distinct URL path, with no shortcuts",
      visuals: [],
      content: `## Creating the REST API Itself

> **REST API build → provide a name → choose endpoint type → choose a security policy** (this lab specifically uses one supporting BOTH TLS 1.2 and 1.3, for maximum browser compatibility during testing — matching the earlier TLS security policy topic) → **endpoint access mode: basic** (Strict Mode is available but deliberately not used here, to keep the lab simple) → **IP address type: IPv4** (IPv6 dual-stack support is available but skipped for simplicity) → create.

---

## ⚠️ The Rule: Every Unique URL Path Needs Its Own Resource

> **REST API design is fundamentally based on URL paths — each DISTINCT path must be created as a SEPARATE resource, with no exceptions.** ⚠️ **This lab needs two different URL patterns**: /user (to fetch all users) and /user/{userId} (to fetch or delete one specific user) — ⚠️ **meaning TWO resources must be created, not one, even though they're closely related.**

**Building the resource tree**:
1. **/user** — created directly as a child of the auto-generated root ("/") resource (matching the resource-hierarchy rule from the earlier topic).
2. **/user/{userId}** — created as a CHILD of /user specifically, not of root directly. ⚠️ **The curly braces around userId mark it as a PATH PARAMETER — a placeholder that gets substituted with an actual value at request time** (e.g. /user/101), since userID is the DynamoDB table's primary key and is what identifies exactly which record to operate on.

---

## What This Sets Up for the Next Step

> **With both resources created, the next step (covered separately) is attaching HTTP methods to each** — /user will get a method for listing/creating users, /user/{userId} will get methods for reading or deleting one specific user, directly mirroring the CRUD design already established in the earlier HTTP API lab.

---

## Exam Framing

> "A REST API needs to support both fetching a list of all users and fetching one specific user by ID" → **two separate resources must be created — /user and /user/{userId} — since REST API requires one resource per distinct URL path, never combining multiple paths into a single resource.** "What do curly braces around a resource path segment (e.g. {userId}) signify?" → **a path parameter — a placeholder substituted with an actual value at request time**, used specifically when a URL segment needs to identify a specific record (like a primary key) rather than being a fixed, unchanging path.
`,
    },
    {
      id: "rest-api-method-request-settings",
      title: "REST API Method Request Settings – The Security Gate That Runs BEFORE the Backend Is Ever Called",
      shortDesc: "Method request settings check the request and reject it right at the gate, before it ever reaches Lambda — a request that fails validation here never triggers the backend at all",
      visuals: [],
      content: `## ⚠️ The Security-Gate Analogy

> **Method request settings define rules a client's request must satisfy BEFORE the backend is ever called.** ⚠️ **Think of it as a security gate at an office entrance — checking ID, entry permission, and purpose before letting anyone in.** ⚠️ **In the request flow, method request checks happen BEFORE the integration request (i.e. before the backend is triggered at all)** — a request failing here is rejected outright, and the backend never even sees it.

---

## Setting 1: Authorization — Who Is Allowed to Call This Method

**Four authorization options**:
1. **None** — no authorization at all; anyone can call the API. Appropriate for a genuinely public API.
2. **AWS IAM** — only AWS users/roles with proper IAM permission can call the API (e.g. a request originating from an EC2 instance's attached role).
3. **Cognito User Pool** — ⚠️ **requires a Cognito User Pool to already exist in the account** (this option is unavailable/hidden until one is created) — only logged-in users, authenticated via a JWT token from Cognito, can call the API.
4. **Lambda Authorizer** — fully custom authorization logic, written and hosted in a separate Lambda function, for any bespoke authentication requirement not covered by the other three.

**Worked example**: a POST /create-order endpoint requiring authorization — a non-logged-in user gets a 401 Unauthorized error; a logged-in, properly authenticated user's request is allowed through.

---

## Setting 2: Request Validator — Checking Required Data Is Present

> **Request validator checks whether required data actually exists in the incoming request** — not authentication, just structural completeness. ⚠️ **Four options: None, Validate Body, Validate Query String Parameters and Headers, and Validate Body + Query String Parameters + Headers.**

### Validate Body

> **Checks only that the request body is present and matches an expected structure.** ⚠️ **Commonly used for POST, PUT, and PATCH methods**, since these are the ones that typically carry a meaningful body. Worked example: a POST /create-user request must include a body with userID, username, and email — request validator confirms this structure exists before the request ever reaches the Lambda function that would actually create the record.

### Validate Query String Parameters and Headers

> **HTTP headers**: extra information sent alongside the request, NOT part of the URL and NOT part of the request body. ⚠️ **Headers are optional by default** — only relevant when the API needs authentication tokens, usage tracking, or metadata (e.g. requiring an API key to be present in a specific header). ⚠️ **A required-header check verifies the named header is present** — a missing required header causes rejection right at the gate.

> **Query string parameters**: key-value pairs appended to the URL after a "?" — ⚠️ **most commonly used with GET requests.** Worked example: GET /user?id=101 — the query string parameter id=101 tells the backend which specific user record to fetch. ⚠️ **Best practice: mark id as a required query parameter** so a GET request missing it is rejected before ever reaching the backend, rather than the backend having to handle a missing-parameter case itself.

---

## Exam Framing

> "An API needs to reject a request missing a required query string parameter BEFORE the Lambda function is even invoked" → **configure a request validator set to validate query string parameters and headers, marking the specific parameter as required** — this check happens entirely at the method-request stage, ahead of the integration request, so an invalid request never triggers (or bills for) the backend at all. "An API should only be callable by AWS resources with proper IAM permissions, not the general public" → **set the method's Authorization setting to AWS IAM** — distinct from Cognito User Pool (end-user login via JWT) and Lambda Authorizer (fully custom logic).
`,
    },
    {
      id: "rest-api-proxy-integration",
      title: "REST API Proxy Integration – The Courier Boy Who Never Opens the Parcel",
      shortDesc: "Proxy mode forwards the request completely untouched, letting a powerful backend handle everything itself — turn it off specifically when a legacy backend needs API Gateway to reshape the request first",
      visuals: [],
      content: `## ⚠️ The Courier Boy Analogy

> **Proxy integration means API Gateway forwards the FULL request to the backend without changing anything at all — no filtering, no modification, no extra processing.** ⚠️ **API Gateway = a courier boy who never opens the parcel, just delivers it exactly as received; the backend (Lambda/HTTP server) = the office worker who actually opens it, reads it, and decides what to do.** ⚠️ **With proxy integration enabled, API Gateway is purely a pass-through — the backend gets the raw, unmodified request and is fully responsible for interpreting it.**

---

## ⚠️ What Gets Forwarded Untouched

> **In proxy mode, everything from the original request passes through as-is**: HTTP method, URL path, query parameters, HTTP headers, and the request body — all forwarded exactly as the client sent them, with zero transformation by API Gateway.

**⚠️ Supported by**: Lambda, HTTP, and VPC Link integrations. ⚠️ **NOT available for AWS service integration** — direct AWS service calls always require the request/response mapping covered in the earlier integration-types topic, since the target service needs its own specific request format.

---

## ⚠️ When to Enable Proxy Integration (the common case — ~90% of modern setups)

> **Use it when**: a simple, fast setup is wanted; the backend is genuinely powerful enough to handle raw requests entirely on its own; API Gateway-level complexity isn't needed; building a modern REST API where the backend already does all its own request parsing and validation. ⚠️ **In most modern applications, the backend is capable enough that this is the default, near-universal choice.**

## ⚠️ When to Disable Proxy Integration

> **Use it when**: API Gateway itself needs to modify the request, filter specific fields, or change the response format — i.e. logic needs to live in API Gateway, not the backend. ⚠️ **The classic real-world case: a legacy backend expects a fixed, older request format, but modern clients send extra fields the legacy system doesn't understand** — API Gateway can filter those extra fields out before forwarding, something proxy mode structurally cannot do since it never inspects the request at all.

---

## Response Transfer Mode: Buffered vs Streamed (Only Relevant When Proxy Is On)

> **Buffered (the common case, ~90% of setups)**: ⚠️ **API Gateway waits for the backend to complete its FULL response before forwarding anything to the client.** **Streamed**: ⚠️ **the backend's response is forwarded to the client in chunks, AS it's generated — the client starts receiving data while the backend is still actively working**, rather than waiting for full completion.

---

## ⚠️ Integration Timeout: Where the 504 Error Comes From

> **The maximum time API Gateway will wait for a backend response before giving up.** ⚠️ **If the backend doesn't respond within this configured time limit, API Gateway returns a 504 error to the client** — regardless of whether the backend eventually would have responded, the client sees a timeout failure once the limit is exceeded.

---

## Exam Framing

> "An API needs to filter out extra fields a legacy backend doesn't understand, or reshape the request before it reaches the backend" → **disable proxy integration** — proxy mode forwards the request completely untouched, so any request modification must happen with proxy OFF, using API Gateway's own mapping/transformation logic instead. "A client receives a 504 error from an API Gateway-fronted API" → **the backend didn't respond within the configured integration timeout** — this is specifically an API Gateway timeout, distinct from a backend-side error response. Remember: **buffered response mode waits for the FULL backend response before forwarding; streamed mode forwards data in chunks as the backend produces it.**
`,
    },
    {
      id: "rest-api-integration-types",
      title: "REST API Integration Types – Five Backends, and Why VPC Link Can't Reach a Private Backend Alone",
      shortDesc: "VPC Link doesn't talk directly to whatever's in your private subnet — it can only reach an ALB or NLB sitting in front of it, which is what actually forwards traffic the rest of the way",
      visuals: [],
      content: `## What Integration Type Actually Decides

> **Integration = where a method's request actually gets sent once the client calls it.** ⚠️ **REST API supports FIVE integration types**, each suited to a different backend scenario.

---

## The Five Integration Types

1. **Lambda function** — the most popular option; API Gateway invokes Lambda and returns its response. The standard choice for serverless backends.
2. **HTTP** — forwards the request to any public HTTP endpoint (e.g. a company's own backend on EC2 or on-premises) — a simple pass-through, no AWS service involved.
3. **Mock** — no real backend at all; API Gateway returns a fixed, predefined response. ⚠️ **Purpose-built for testing and demos**, not real traffic.
4. **VPC Link** — a private bridge between API Gateway and resources inside a VPC.
5. **AWS service** — API Gateway calls an AWS service (S3, DynamoDB, SQS, SNS, Kinesis, etc.) DIRECTLY, with no Lambda function in between.

---

## ⚠️ VPC Link: Why It Can't Reach the Private Backend Directly

> **API Gateway is public; backend services can live in a private VPC subnet with no public access at all.** ⚠️ **VPC Link cannot communicate directly with resources sitting in that private subnet — it specifically requires an ALB or NLB in between.** ⚠️ **The real chain: API Gateway → VPC Link → ALB/NLB → the actual private backend.** VPC Link is the bridge to the load balancer, not directly to the backend resource itself.

**⚠️ Version history matters**: ⚠️ **VPC Link v1 supports ONLY NLB; VPC Link v2 (the newer version) adds support for ALB as well** — so a modern VPC Link setup can front either load balancer type, but the older v1 was NLB-only.

**Why this matters**: it enables secure backend access without ever exposing the private resource to the public internet.

---

## AWS Service Integration: Direct, No Lambda Needed

> **API Gateway can call AWS services directly — S3, DynamoDB, SQS, SNS, Kinesis — completely bypassing Lambda.** ⚠️ **This requires: an IAM role granting the API Gateway permission to call the target service, AND request/response mapping (via Velocity Template Language / mapping templates)** to translate between the incoming HTTP request and whatever format the target AWS service expects. Example: a POST request configured to push records directly into a Kinesis Data Stream, with zero Lambda function involved anywhere in the flow.

---

## ⚠️ REST API vs HTTP API: Breadth of AWS Service Integration

> **Both REST API and HTTP API support HTTP, VPC Link, and AWS service integration types** — but ⚠️ **REST API supports a genuinely BROADER, more flexible set of AWS service integrations, with advanced mapping capabilities; HTTP API supports only a LIMITED set of service integrations**, designed specifically for simpler, lower-cost use cases.

---

## ⚠️ Exam Tip: The Deciding Question

> ⚠️ **"Direct integration with MANY AWS services, complex mapping requirements" → REST API.** ⚠️ **"Simple, low-cost API with a LIMITED set of AWS service integrations" → HTTP API.** This is a direct extension of the earlier cost/feature-set tradeoff already established between the two API types — broader integration flexibility is simply one more item on REST API's side of that tradeoff.

---

## Exam Framing

> "A REST API needs to push data directly into a Kinesis Data Stream, without any Lambda function in the middle" → **AWS service integration** — API Gateway calling Kinesis directly, requiring an IAM role plus request/response mapping templates. "An API Gateway needs to reach a backend service sitting in a private VPC subnet with no public IP" → **VPC Link — but remember it requires an ALB or NLB in front of that private resource; VPC Link itself cannot connect directly to the private backend.** Choosing between REST and HTTP API purely on integration breadth: **many AWS services + complex mapping → REST API; simple + limited integrations + lower cost → HTTP API.**
`,
    },
    {
      id: "rest-api-resources-and-methods",
      title: "REST API – Resources and Methods: The Structural Layer HTTP API Doesn't Have",
      shortDesc: "HTTP API just has flat routes triggering an integration directly — REST API forces every request through a resource-then-method hierarchy, which is exactly where all its advanced features actually live",
      visuals: [],
      content: `## ⚠️ The Structural Difference From HTTP API

> **HTTP API's flow is flat and simple: client sends a request → the matching route triggers its integration directly.** ⚠️ **REST API adds an extra structural layer: create a RESOURCE first, then create a METHOD inside that resource — and the method is where ALL of REST API's advanced features actually get configured** (request/response inspection, validation, transformation, and everything else covered in earlier topics).

---

## Resources: URL Paths, Organized in a Tree Under the Root

> **A resource = a URL path** (e.g. /user, /product). ⚠️ **Every REST API automatically gets ONE default resource called "/" — the route resource** — created automatically, and it can NEVER be deleted, since it's the mandatory root every other resource nests under.

**⚠️ Every additional resource is created as a CHILD of the root (or of another resource) — nothing can exist parallel to root.** Example: creating /users makes it a child resource of "/". ⚠️ **Child resources can themselves have children** — e.g. /user/{id} as a child of /user — mirroring the classic use case of "/users" listing all users vs "/user/{id}" fetching one specific user.

**Invoke URL structure**: the base API Gateway URL + stage, with the resource's path appended — root resource contributes nothing extra to the URL; a child resource like /users appends exactly that segment.

---

## ⚠️ Methods: Where the Actual REST API Features Live

> **A method = an HTTP verb attached to a specific resource.** ⚠️ **Methods can ONLY exist inside a resource — there's no such thing as a method without a resource** (even the root "/" resource itself can have methods attached directly to it). ⚠️ **This is the critical structural rule: ALL of REST API's advanced features — method type, integration type, proxy integration, request settings, query parameters, headers, request body validation — are configured AT THE METHOD LEVEL**, not at the resource level.

---

## Supported HTTP Method Types

> **GET** (read data), **POST** (add a new record), **PUT** (full update/replace), **PATCH** (partial update), **DELETE** (remove a record), **HEAD** (headers only, no body), **OPTIONS** (used for CORS), and ⚠️ **ANY — a special catch-all matching EVERY HTTP verb, routing all of them to ONE single backend integration.**

**⚠️ Best practice vs the ANY shortcut**: ⚠️ **creating separate Lambda functions per method (matching the earlier lab's approach — one function per CRUD operation) is the established best practice**, since it keeps each function focused on one job. ⚠️ **ANY is explicitly flagged as more advanced/complex, letting one function handle everything — a valid option, but not the recommended default pattern.**

---

## Exam Framing

> "In REST API, where are advanced features like request validation, transformation, and integration type actually configured?" → **at the METHOD level, not the resource level** — a resource is purely a URL path; the method (the HTTP verb attached to that path) is where every REST-API-specific capability actually gets set up. "Can a resource be created that sits parallel to the root '/' resource, rather than nested under it?" → **no — every resource, without exception, is created as a child somewhere under the root resource**, which itself cannot be deleted since it's the mandatory starting point for the entire resource tree.
`,
    },
    {
      id: "api-gateway-strict-mode-domain-fronting",
      title: "API Gateway Strict Mode – Catching a Domain-Fronting Attack by Checking If the TLS Handshake Lies About the HTTP Request",
      shortDesc: "A normal request always names the same domain twice — once during the TLS handshake, once in the HTTP host header — domain fronting exploits the rare case where those two names quietly disagree",
      visuals: [],
      content: `## ⚠️ When Endpoint Access Mode Even Appears

> **Endpoint Access Mode (Basic vs Strict) only shows up when a strong/modern security policy is selected — e.g. TLS 1.3 or post-quantum cryptography.** ⚠️ **Selecting an older/legacy TLS version (e.g. TLS 1.0) makes this option disappear entirely** — Strict Mode is fundamentally tied to using a modern TLS policy, not a standalone independent setting.

**Basic mode**: allows all clients to access the API — no additional protection beyond the TLS policy itself. **Strict mode**: adds real, additional protection — specifically against domain-fronting attacks.

---

## ⚠️ Understanding Domain Fronting First

> **Every client-to-API request actually involves TWO separate steps that name a domain**: (1) the **TLS handshake**, where the client sends a Server Name Indication (SNI) saying essentially "I want to connect to api.example.com," and the server responds with its certificate, and (2) the actual **HTTP request**, which includes a **hostname** in its Host header — normally the SAME domain named in step 1.

**⚠️ In a NORMAL, legitimate request, the SNI (from the TLS handshake) and the HTTP Host header ALWAYS match** — both name the same domain, e.g. api.example.com in both places.

**⚠️ Domain fronting exploits the case where they DON'T match**: the TLS handshake claims one domain (e.g. api.example.com, giving the connection a legitimate-looking certificate), but the actual HTTP request's Host header names a completely DIFFERENT domain. ⚠️ **This mismatch lets an attacker hide or misroute traffic behind a legitimate-looking TLS connection** — the TLS handshake succeeds normally, but the request gets routed somewhere the client never openly declared during the handshake.

---

## ⚠️ What Strict Mode Actually Checks

**Check 1 — Same endpoint type**: ⚠️ **the incoming request must originate from the SAME endpoint type the API is actually configured for.** A regional API must receive requests via the regional path; a private API must receive requests via its VPC endpoint; an edge-optimized API must receive requests via CloudFront. ⚠️ **A request arriving through the "wrong" path for the configured endpoint type is rejected outright.**

**Check 2 — SNI-to-hostname matching**: ⚠️ **available ONLY for regional and private endpoints** — strict mode verifies that the domain named in the TLS handshake's SNI genuinely matches the domain named in the HTTP request's Host header. ⚠️ **A mismatch means the request is REJECTED — this is exactly what prevents a domain-fronting attack from succeeding.**

**⚠️ For edge-optimized endpoints specifically, SNI/hostname matching is NOT performed by strict mode directly — instead, protection against domain fronting comes from CloudFront's own built-in domain-fronting protection**, since edge-optimized APIs are always fronted by CloudFront anyway.

---

## Exam Framing

> "An attacker successfully establishes a TLS connection claiming to be api.example.com, but the actual HTTP request inside that connection targets a completely different, unrelated domain" → **this is a domain-fronting attack** — enabling Strict Mode on the REST API's endpoint access setting rejects requests where the TLS SNI and the HTTP Host header don't match, directly closing this attack path. "Does Strict Mode's SNI/hostname verification apply the same way to an edge-optimized endpoint as it does to a regional endpoint?" → **no — SNI/hostname matching is Strict Mode's own mechanism for regional and private endpoints specifically; edge-optimized endpoints instead rely on CloudFront's own built-in domain-fronting protection**, since those requests are always routed through CloudFront first.
`,
    },
    {
      id: "rest-api-tls-security-policy",
      title: "REST API TLS Security Policy – Options Are Endpoint-Type-Dependent, and Scoped Only to the Default Invoke URL",
      shortDesc: "The available TLS policy options change based on which endpoint type was already selected — and whatever's chosen here only governs AWS's default invoke URL, never a custom domain, which gets its own separate policy",
      visuals: [],
      content: `## What TLS Actually Does

> **TLS (Transport Layer Security) encrypts the connection between the client and API Gateway** — preventing attackers from reading the data in transit, blocking man-in-the-middle attacks, and confirming the client is genuinely talking to the real API Gateway. ⚠️ **Think of it as a secure tunnel between client and API** — it's the mechanism behind the difference between an HTTP site and an HTTPS site.

---

## ⚠️ Available Security Policies Depend on the Endpoint Type Already Chosen

> **The TLS security policy options shown are directly tied to whichever endpoint type (regional, edge-optimized, private) was already selected earlier** — ⚠️ **choosing regional highlights ONLY the policies applicable to regional endpoints; choosing edge-optimized highlights only ITS applicable policies; the other endpoint types' policies stay grayed out** — the two settings aren't independent choices.

---

## What the Security Policy Controls

> **Minimum TLS version, allowed cipher suites, and whether FIPS mode is required.**

**TLS version options**: ⚠️ **TLS 1.2 (introduced 2008, strong encryption, broadly supported by modern browsers/apps) vs TLS 1.3 (released 2018, faster handshake, better performance, more secure than 1.2 — becoming the modern standard)** — the general guidance: **prefer TLS 1.3 whenever the client/application supports it.**

**Additional modifiers**:
- **FIPS** (Federal Information Processing Standard): ⚠️ **government-approved cipher requirements — specifically needed for US government, Department of Defense, banking, and health-sector compliance use cases.**
- **PFS** (Perfect Forward Secrecy): ⚠️ **the encryption key changes for every new connection** — even if a key is later stolen, only that one connection's data is compromised, not all past traffic.
- **PQC** (Post-Quantum Cryptography): encryption specifically designed to remain unbreakable even by future quantum computers, which are expected to eventually break traditional encryption methods.

---

## ⚠️ Critical Scoping Rule: This Policy Applies ONLY to the Default AWS Invoke URL

> **The security policy chosen here governs ONLY the AWS-provided default invoke URL** (the auto-generated URL used for testing, e.g. via Postman) — ⚠️ **it does NOT apply to a custom domain, if one is later configured.** ⚠️ **A custom domain gets its OWN, separately-configured security policy** — meaning a REST API can genuinely have two different TLS policies active simultaneously: one for the default invoke URL, another for the custom domain.

**⚠️ Custom domains also unlock additional security features the default invoke URL doesn't offer**: custom SSL/TLS certificates, mutual TLS (mTLS) authentication, and hostname validation — covered in a later dedicated custom-domain topic.

---

## Exam Framing

> "A REST API needs the strongest, most modern TLS protection available, assuming the client fully supports it" → **TLS 1.3** — faster handshake, better performance, and more secure than TLS 1.2, the recommended default whenever client support allows it. "Does configuring a TLS security policy for a REST API automatically apply that same policy to a later-configured custom domain?" → **no — the security policy chosen during REST API creation applies ONLY to the default AWS invoke URL; a custom domain requires its own separately configured security policy.**
`,
    },
    {
      id: "rest-api-endpoint-types",
      title: "REST API Endpoint Types – Regional, Edge-Optimized, Private, and the One-Endpoint-Per-API Rule",
      shortDesc: "One REST API gets exactly ONE endpoint type — needing both public and VPC-only access means creating two separate APIs, never one API switching between modes",
      visuals: [],
      content: `## ⚠️ Three Endpoint Types, Each Controlling How Clients Reach the API

> **REST API supports three endpoint types, each deciding how clients physically reach the API and how AWS routes the request internally.**

---

## Regional Endpoint

> **The API deploys into ONE specific AWS region — clients connect directly over the internet, and the request travels straight to that region.** ⚠️ **Flow: client → internet → API Gateway (in its one region) → backend logic (Lambda, etc.)**

**When to use**: users are geographically near the API's region — e.g. an India-focused application hosted in ap-south-1, used almost entirely by users in India, gets genuinely low latency.

**⚠️ Limitation**: users far from the region experience meaningfully higher latency — a US or European user hitting an India-hosted regional API has to route all the way to India for every request.

---

## Edge-Optimized Endpoint

> **Uses Amazon's global CDN (CloudFront) in front of the REST API — solving regional endpoint's international-latency problem.** ⚠️ **Flow: global client → connects to their NEAREST CloudFront edge location → CloudFront routes the request to the API's actual region.** ⚠️ **The API still physically lives in one region — CloudFront just gets users to that region faster** by using AWS's global edge network for the first hop.

**When to use**: a public API with genuinely global users — e.g. a mobile app used across many countries needing consistently low latency worldwide.

**⚠️ Limitations**: slightly more expensive (CloudFront usage adds cost), and latency can occasionally be higher due to CloudFront propagation delay when changes are first deployed.

---

## Private Endpoint

> **Accessible ONLY from within a VPC — never from the public internet at all.** ⚠️ **Flow: a resource inside a VPC (EC2, Lambda, ECS) → VPC interface endpoint → private API Gateway.** ⚠️ **A VPC interface endpoint MUST be explicitly created to provide this connectivity** — the API Gateway itself isn't placed inside the VPC; the endpoint is what bridges the VPC to the private API.

**When to use**: internal company APIs, secure backend-to-backend communication where public internet access must be structurally blocked. ⚠️ **"Only accessible inside the VPC" isn't really a limitation here — it's the entire point of choosing this endpoint type.**

---

## ⚠️ The Critical Rule: One API, One Endpoint Type — Never Multiple

> **A single REST API can have ONLY ONE endpoint type — regional, edge-optimized, OR private, never a combination, and never switchable per-request.** ⚠️ **If a use case genuinely needs BOTH public access AND VPC-only access, the solution is creating TWO SEPARATE REST APIs** — one configured regional (or edge-optimized) for public access, and a second configured private for VPC-only access — never one API attempting to serve both modes.

---

## Exam Framing

> "An application needs to serve both public internet users AND internal VPC-only backend services from the same logical API" → **two separate REST APIs are required — one public-facing (regional or edge-optimized) and one private** — a single REST API cannot have more than one endpoint type. "A public API serves users spread across multiple continents, and latency needs to be minimized for all of them" → **edge-optimized endpoint**, using CloudFront's global edge network to get each user to the API's region via the shortest possible path — plain regional endpoint would leave distant users with meaningfully higher latency.
`,
    },
    {
      id: "api-gateway-lab-part4-postman-testing-and-cleanup",
      title: "API Gateway Lab – Part 4: Testing From Outside AWS With Postman, and What to Delete (and Not Delete) Afterward",
      shortDesc: "Postman stands in for a real frontend entirely — the earlier Lambda console tests only proved the backend logic worked, this is the first time the request genuinely originates from OUTSIDE AWS",
      visuals: [],
      content: `## ⚠️ Postman Replaces the Need to Build a Real Frontend

> **Postman is a free tool for sending HTTP requests manually, without writing any actual frontend application code.** ⚠️ **This step is meaningfully different from the earlier Lambda console testing (Part 2)** — those tests proved the Lambda logic worked correctly in isolation, but the request still originated from INSIDE the AWS console. ⚠️ **Testing via Postman means the request genuinely comes from outside AWS entirely** — proving the full public-facing chain (Postman → API Gateway's invoke URL → Lambda → DynamoDB) actually works end to end, exactly as a real mobile or web app would experience it.

---

## Testing All Three Routes

> **Every test uses the API's "invoke URL"** (found on the API Gateway console) as the base, with the specific route path and HTTP method set in Postman.

1. **Create (POST /user)**: Postman method = POST, URL = invoke URL + /user, body = JSON payload with the new user's data → send → response confirms "user created successfully" → ⚠️ **verified independently by refreshing the DynamoDB table and seeing the new record actually appear.**
2. **Get (GET /user/{userId})**: Postman method = GET, URL includes the specific user ID in the path → send → the exact record (email, name, etc.) is returned in the response.
3. **Delete (DELETE /user/{userId})**: same URL pattern as GET, method changed to DELETE → send → confirms deletion → ⚠️ **verified two ways: refreshing DynamoDB shows the record is gone, AND re-sending the same GET request now returns "user not found"** — proving the delete genuinely took effect, not just that the delete call itself succeeded.

---

## ⚠️ Cleanup: What Gets Deleted vs What Stays

> **Only the API Gateway itself gets deleted after this lab** — ⚠️ **the DynamoDB table and all three Lambda functions are deliberately KEPT**, because the upcoming follow-up lab reuses them, swapping ONLY the API Gateway from HTTP API to REST API to directly compare the two hands-on. ⚠️ **Keeping the Lambda functions and DynamoDB table costs nothing extra**: Lambda only bills when actually triggered, and an empty DynamoDB table (no records) incurs no meaningful RCU/WCU charges — so leaving them in place between labs is genuinely free.

---

## Exam Framing

> "Why test an API through a tool like Postman rather than only testing the underlying Lambda functions directly from the Lambda console?" → **Postman genuinely originates the request from OUTSIDE AWS, proving the full public-facing chain (API Gateway's invoke URL → routing → Lambda → DynamoDB) actually works — Lambda-console testing only verifies the backend logic in isolation, not the complete integration.** "A lab is about to be repeated with a different API Gateway type (REST instead of HTTP) — what should be deleted between the two lab runs?" → **only the API Gateway itself — the underlying Lambda functions and DynamoDB table should be kept and reused**, since they cost nothing when idle and swapping just the gateway type is the entire point of the comparison exercise.
`,
    },
    {
      id: "api-gateway-lab-part3-http-api-routes",
      title: "API Gateway Lab – Part 3: One HTTP API, Three Routes, Each Mapped to Its Own Lambda Function",
      shortDesc: "Lambda has no public HTTP endpoint at all — it literally cannot be invoked from outside AWS without something in front of it, which is the whole reason API Gateway exists in this flow",
      visuals: [],
      content: `## ⚠️ Why a Mobile App Can't Just Call Lambda Directly

> **A Lambda function has NO public HTTP endpoint of its own — it structurally cannot be triggered directly from the internet, and doing so wouldn't be secure even if it were technically possible.** ⚠️ **API Gateway acts as the "front desk"**: it accepts requests from the outside world (the mobile/web app) and forwards them to the correct Lambda function based on the request's path and method.

**API Gateway's responsibilities here**: accept the HTTP request from the client, route it to the correct Lambda function (based on URL path + HTTP method), and send the Lambda function's response back to the caller. ⚠️ **Note: input validation, throttling, and WAF-style security are NOT part of this specific lab, since HTTP API is being used — these ARE available on REST API**, covered in the follow-up REST API version of this same lab.

---

## ⚠️ One Single HTTP API, Three Separate Routes

> **Only ONE HTTP API needs to be created — "user-API"** (IPv4, default stage — stages like dev/production are a separate concept for later, not needed for this simple lab). ⚠️ **All three CRUD operations are handled by THIS SAME API, differentiated purely by route (path + method), not by creating three separate APIs.**

**The three routes, each attached to its own Lambda integration**:

1. **POST /user** → attach integration → **create user function.** Triggered whenever the frontend sends a POST request to the /user path.
2. **GET /user/{userId}** → attach integration → **get user function.** ⚠️ **Note the path pattern includes a user ID placeholder** — this route reads a SPECIFIC user's record based on the ID in the URL.
3. **DELETE /user/{userId}** → attach integration → **delete user function.** ⚠️ **Same path pattern as GET** (/user/{userId}), but a different HTTP method, routed to a different Lambda function entirely.

⚠️ **This demonstrates a key API Gateway capability: the SAME path (/user/{userId}) can support multiple HTTP methods, each independently routed to a completely different backend integration** — the method itself, not just the path, is part of what determines which Lambda function actually gets triggered.

---

## What Exists After This Step

> **Once all three routes are created and integrated, API Gateway provides a "trigger URL"** — the actual public endpoint the frontend will call. ⚠️ **The lab can be fully tested even WITHOUT building a real frontend** — the next lab step demonstrates testing this trigger URL directly, without needing an actual mobile or web app built first.

---

## Exam Framing

> "Why can't a mobile app invoke a Lambda function directly, without any intermediary service?" → **Lambda has no public HTTP endpoint at all — it structurally cannot be triggered from outside AWS on its own, which is exactly the gap API Gateway fills.** "How does a single API Gateway route both a POST /user request and a GET /user/{userId} request to two completely different Lambda functions?" → **each route is defined by the COMBINATION of path AND HTTP method** — the same path can support multiple methods, each independently mapped to its own backend integration, which is exactly how this lab's three CRUD routes coexist on one API.
`,
    },
    {
      id: "api-gateway-lab-part2-lambda-functions",
      title: "API Gateway Lab – Part 2: Testing Each Lambda Function Directly, Before API Gateway Even Enters the Picture",
      shortDesc: "Every Lambda function gets triggered and verified straight from the Lambda console's own Test feature first — proving each function works standalone before wiring API Gateway on top of it",
      visuals: [],
      content: `## ⚠️ Same Pattern Repeated Three Times, Once Per CRUD Operation

> **Each of the three Lambda functions (create user, get user, delete user) follows the identical setup process**: create a new Lambda function from scratch, attach the existing IAM role created in Part 1 (Lambda-DynamoDB-execution-role — reused for all three, no need to create a new role each time), paste in the provided function code, deploy, then test directly from the Lambda console.

---

## ⚠️ Critical Verification Step: Test Each Function BEFORE Wiring API Gateway

> **Every function is tested directly from the Lambda console's own "Test" feature — creating a test event with a JSON payload matching what the function expects, then running it and inspecting both the function's response and the actual DynamoDB table.** ⚠️ **This is deliberate: proving each Lambda function works correctly in isolation FIRST, before adding API Gateway on top, makes any later issue much easier to isolate** — if something breaks after API Gateway is wired in, the Lambda logic itself is already confirmed working.

**Create user function test**: a JSON payload representing a new user record → running the test returns success code 201 ("user created successfully") → refreshing the DynamoDB table's item view confirms the new record actually exists.

**Get user function test**: a payload specifying a user ID to look up → ⚠️ **tested with BOTH a valid existing ID (returns the record successfully) AND a non-existent ID (returns a "user not found" response)** — verifying both the success and not-found code paths work correctly, not just the happy path.

**Delete user function test**: a payload specifying the user ID to remove → running the test confirms deletion, and refreshing the DynamoDB table shows the record is genuinely gone.

---

## ⚠️ Why Only Three Functions, Not Four (No Update)

> **A fourth Lambda function (update) could technically be added, but is deliberately left out of this lab** — ⚠️ **explicitly to avoid unnecessary complexity, since the lab's actual purpose is teaching API Gateway's mechanics, not building an exhaustive CRUD reference implementation.**

---

## Exam Framing

> "Before wiring API Gateway on top of a set of Lambda functions, what's the recommended verification step?" → **test each Lambda function directly from the Lambda console's own Test feature first** — confirming the backend logic works in isolation makes it far easier to isolate whether a later integration issue is in the Lambda code or in the API Gateway configuration. This is the same "verify each layer before adding the next" discipline that appears throughout AWS troubleshooting generally.
`,
    },
    {
      id: "api-gateway-lab-part1-prerequisites",
      title: "API Gateway Lab – Part 1: DynamoDB Table, Separated Lambda Functions, and the IAM Role Lambda Needs to Even Talk to DynamoDB",
      shortDesc: "Three separate Lambda functions instead of one, on purpose — cramming create/read/delete into a single function works technically, but violates separation of concerns and becomes harder to test and maintain",
      visuals: [],
      content: `## Step 1: Create the DynamoDB Table (the Backend)

> **Table name: "user_table"** (use the exact same name — it gets referenced directly in the Lambda code in the next lab part). **Partition key: "userID"** (note the capitalization — capital ID, everything else lowercase), **type: String.** No other settings need to be touched.

---

## ⚠️ Step 2 (Conceptual): Why an API Is Needed at All

> **A mobile app (React Native, Flutter, etc.) cannot talk to the DynamoDB table directly** — the same "frontend can never reach DynamoDB directly" rule from the earlier CRUD topic, now applied concretely. ⚠️ **APIs are needed specifically to store new records, fetch records, and delete records** on behalf of the frontend.

**API logic** = the actual backend code that runs when a user saves, fetches, or deletes data — can be written in any language (Python, Node.js, Java, PHP, Go), and can be hosted on any compute platform (Lambda, EC2, ECS, EKS). This lab specifically uses Lambda.

---

## ⚠️ Three SEPARATE Lambda Functions, Deliberately — Not One Combined Function

> **The plan: create user function, get user function, delete user function — three distinct Lambda functions, each handling exactly one CRUD task.** ⚠️ **Technically, all three tasks COULD be crammed into a single Lambda function — but this is explicitly called out as bad practice.** ⚠️ **Reasoning: a single combined function becomes messy and harder to manage; separate, single-purpose functions follow the separation-of-concerns principle, and are genuinely easier to test and maintain.** This directly echoes the "each microservice does one job" principle from the earlier microservices topic, now applied at the individual-function level.

---

## Step 3: The IAM Role Lambda Needs to Access DynamoDB

> ⚠️ **AWS services cannot act on each other by default — a Lambda function needs an explicit IAM role granting it permission before it can read or write DynamoDB at all.** ⚠️ **The analogy: just like a person can't enter a building without an ID card, Lambda needs a "digital permission card" (an IAM role) to access DynamoDB** — without it, every DynamoDB operation from the Lambda functions would simply fail.

**Creating the role**: IAM → Roles → Create role → trusted entity **Lambda** → attach **AmazonDynamoDBFullAccess** (both v1 and v2 versions selected) → name it **"Lambda-DynamoDB-execution-role"** (use this exact name — it gets referenced again in upcoming lab steps).

⚠️ **Best-practice callout, explicitly acknowledged and deliberately skipped for this lab**: production should scope this permission to the SPECIFIC DynamoDB table only, not full account-wide DynamoDB access — full access is used here purely to keep focus on learning API Gateway itself, not IAM policy scoping.

---

## Exam Framing

> "Why does a Lambda function fail with an access-denied error when trying to read/write a DynamoDB table, even though both are in the same AWS account?" → **AWS services never have implicit permission to act on each other — the Lambda function needs an explicit IAM role (e.g. with DynamoDBFullAccess or a table-scoped policy) attached before it can perform any DynamoDB operation.** "Why build three separate Lambda functions instead of one function handling create, read, and delete together?" → **separation of concerns — a single combined function becomes harder to test, maintain, and reason about; one function per responsibility is the established best practice, mirroring the same principle behind microservices architecture generally.**
`,
    },
    {
      id: "api-gateway-lab-introduction",
      title: "API Gateway Hands-On Lab – The Four-Part Plan (HTTP API First, REST API Later for Direct Comparison)",
      shortDesc: "This lab is deliberately built with HTTP API first — the exact same lab gets rebuilt with REST API next, specifically so the earlier feature comparison can be felt hands-on, not just memorized",
      visuals: [],
      content: `## What This Lab Builds

> **A working front end → API Gateway → Lambda → DynamoDB flow, implementing 3 CRUD operations**: ⚠️ **POST (create a new record), GET (read a profile), and DELETE (delete an account)** — deliberately excluding UPDATE for this particular lab's scope. ⚠️ **This lab uses HTTP API specifically — the exact same lab gets repeated with REST API in a follow-up lab**, so the REST-vs-HTTP feature differences from the earlier comparison topics can be experienced hands-on, not just memorized.

---

## The Three Tools Used

> **DynamoDB** (the backend data store), **AWS Lambda** (hosts the actual CRUD logic — though this specific choice of compute platform is arbitrary; EC2, ECS, or EKS would work just as well), and **API Gateway** (the secure, public-facing entry point that exposes the Lambda functions to the front end, with logging on every trigger).

---

## ⚠️ The Complete Request Flow

> **Front end sends an HTTP request → API Gateway receives it and triggers the matching Lambda function → Lambda performs the actual DynamoDB operation.** ⚠️ **The front end never talks to DynamoDB or even Lambda directly — API Gateway is always the mandatory intermediary**, exactly matching the architecture established in the earlier CRUD topic.

---

## The Four-Part Lab Structure

1. **Part 1 — Prerequisites**: setting up whatever needs to exist before building the actual API logic (e.g. the DynamoDB table, IAM roles).
2. **Part 2 — Create the API using Lambda**: writing the actual CRUD logic as Lambda functions.
3. **Part 3 — Create the API Gateway (HTTP API)**: exposing those Lambda functions publicly and securely.
4. **Part 4 — Test the complete functionality**: verifying the full front-end-to-DynamoDB flow actually works end to end.

---

## Exam Framing

> This is purely a lab-scoping overview — the one concrete detail worth remembering is that ⚠️ **this exact same lab gets repeated with REST API afterward, specifically as a deliberate teaching device to make the REST-vs-HTTP API feature differences tangible rather than purely theoretical.** The underlying architecture (front end → API Gateway → Lambda → DynamoDB, front end never touching the backend directly) stays identical between both versions — only the API Gateway TYPE changes.
`,
    },
    {
      id: "crud-and-api-gateway-lambda-dynamodb-flow",
      title: "CRUD Operations and the Website → API Gateway → Lambda → DynamoDB Flow",
      shortDesc: "DynamoDB simply refuses direct public access, so the frontend can never talk to it directly — the only path in is through an API, and API Gateway is what makes that API safely reachable",
      visuals: [],
      content: `## CRUD: The Four Operations Every Backend Performs

> **CRUD = Create, Read, Update, Delete — the backbone of virtually every application that stores data.** ⚠️ **Each CRUD operation maps to a specific HTTP method**: Create → **POST**, Read → **GET**, Update → **PUT**, Delete → **DELETE**.

**Mapped to DynamoDB operations specifically**: Create → **PutItem** (write a new record), Read → **GetItem / Scan**, Update → **UpdateItem**, Delete → **DeleteItem**.

---

## ⚠️ The Core Problem: DynamoDB Cannot Be Reached Directly From a Frontend

> **A website's frontend (even one hosted on EC2) CANNOT talk to DynamoDB directly.** ⚠️ **DynamoDB does not allow direct public access at all — this is a deliberate security boundary, not a missing feature.** ⚠️ **The frontend must always go through an API instead** — there is no other supported path from a public-facing website into DynamoDB.

---

## The Solution: One API Per CRUD Operation

> **Worked example — a user-profile system**: registering a user (Create/POST), viewing a profile (Read/GET), updating name/email (Update/PUT), and deleting an account (Delete/DELETE) each require a SEPARATE API, each performing its own DynamoDB operation. ⚠️ **Four distinct CRUD operations → four distinct APIs**, each doing exactly one job — directly mirroring the same "each service/API does one thing" principle from the earlier microservices topic.

---

## ⚠️ The Final Flow: Website → API Gateway → API (Lambda) → DynamoDB

> **The frontend never talks to DynamoDB directly at any point.** ⚠️ **The complete chain**: Website → API Gateway → the actual API logic (hosted in Lambda in this course's lab) → DynamoDB — and the SAME chain runs in reverse for the response. ⚠️ **API Gateway's role in this specific chain**: exposing the four Lambda-hosted CRUD APIs safely to the public internet with a clean URL, plus the security/logging/throttling/authentication features already covered in earlier topics** — API Gateway is what makes those otherwise-private Lambda functions safely reachable from a public website at all.

**⚠️ The underlying rule this whole chain enforces**: "create the API, write the CRUD logic (in Lambda), expose it securely through API Gateway" — this exact pattern is what the upcoming hands-on lab implements end-to-end.

---

## Exam Framing

> "Why can't a website's frontend query DynamoDB directly, even though both are technically within the same AWS account?" → **DynamoDB deliberately does not allow direct public access — the frontend must always go through an API (typically backed by Lambda) instead, with API Gateway providing the public-facing, secured entry point into that API.** "An application needs four separate operations to manage user records: creating, viewing, updating, and deleting a profile" → **four separate CRUD-mapped APIs (POST/GET/PUT/DELETE respectively)**, each performing exactly one DynamoDB operation, all exposed through a single API Gateway.
`,
    },
    {
      id: "websocket-api",
      title: "WebSocket API – The Connection That Never Closes After One Exchange",
      shortDesc: "Three exam keywords give it away instantly: two-way communication, real-time data, long-lived connection — and caching isn't just unsupported, it structurally makes no sense for live data",
      visuals: [],
      content: `## ⚠️ The One Structural Difference From REST/HTTP API

> **REST API and HTTP API both follow the same pattern: one request → one response → connection CLOSED.** ⚠️ **WebSocket API keeps the connection OPEN — messages can flow in EITHER direction, at ANY time, without a new connection being established for each exchange.** ⚠️ **This single structural difference — real-time, two-way, persistent connection — is what makes WebSocket fundamentally different from REST/HTTP API, not just a feature variation of the same model.**

---

## ⚠️ The Three Exam Keywords

> **Two-way communication, real-time data, long-lived connection — if a question contains any of these three phrases, WebSocket API is almost certainly the answer.**

**Concrete use cases**: live chat, live notifications, live dashboards, collaboration tools (Zoom, shared whiteboards, Google Docs-style live editing), real-time location tracking (e.g. delivery tracking in Swiggy/Zomato-style apps). ⚠️ **The unifying thread: anywhere "live" genuinely belongs in the description, WebSocket API is the fit.**

---

## Feature Support Summary

| Feature | Supported? |
|---|---|
| Two-way communication | ✅ Yes (its core purpose) |
| Real-time data / long-lived connection | ✅ Yes |
| Lambda integration | ✅ Yes |
| ALB integration | ❌ No |
| JWT authentication | ✅ Yes |
| Cognito authentication | ✅ Yes |
| API keys | ❌ No — API-keys-specific to REST API only |
| WAF | ❌ No |
| ⚠️ Caching | ❌ **No — and not even a meaningful gap, since caching doesn't apply to real-time, constantly-changing live data in the first place** |
| Mapping templates | ✅ Basic support |
| Routing | ✅ Yes |

---

## Exam Framing

> "An application needs live, bidirectional updates — e.g. a chat feature or a real-time delivery-tracking map — without repeatedly opening new HTTP connections for each update" → **WebSocket API** — the only API Gateway type built for a persistent, two-way connection rather than the request-response-close pattern REST/HTTP API both use. "Why doesn't WebSocket API support response caching, unlike REST API?" → **caching structurally doesn't fit real-time data** — the whole point of a WebSocket connection is delivering fresh, live updates continuously, which a cached response would directly contradict.
`,
    },
    {
      id: "rest-api-vs-http-api-part2",
      title: "REST API vs HTTP API (Part 2) – The Real Decision Maker: Request/Response Transformation",
      shortDesc: "HTTP API is fast precisely because it never touches the request — REST API's ability to modify, validate, and reshape data before it reaches the backend is what actually decides which type to pick",
      visuals: [],
      content: `## ⚠️ Request/Response Transformation: The Actual Decision Maker

> **REST API can modify the request or response BEFORE it reaches the backend** — converting formats (e.g. XML to JSON), adding/removing fields, reshaping the payload entirely. ⚠️ **HTTP API does NONE of this — whatever arrives from the client gets forwarded to the backend completely untouched, with zero intervention.** ⚠️ **This is exactly WHY HTTP API is faster: skipping any transformation logic means less processing work per request.**

**Three specific REST-API-only capabilities under this umbrella, ALL unsupported by HTTP API**:
1. **Request/response transformation** — reshape data before it reaches the backend.
2. **Input validation** — reject malformed requests before they ever reach the backend (e.g. a missing required email field gets blocked at the gateway).
3. **Mapping templates** (Velocity Template Language) — customize input/output format via templates, e.g. restructuring the request body entirely.

⚠️ **These three are grouped together because they all stem from the same root capability — REST API actively inspects and can alter the payload; HTTP API is a pure pass-through.**

---

## Performance and Cost

- **Caching**: ⚠️ **REST API supports response caching (storing backend responses to serve repeat requests faster, with configurable refresh); HTTP API does NOT support caching at all** — but this is framed as a non-issue for HTTP API, since its pass-through design is already fast without needing a cache layer.
- **Cost**: ⚠️ **HTTP API is roughly 70% cheaper than REST API** — the same figure from the earlier part-1 topic, now tied directly to the "fewer features = lower cost" tradeoff.

---

## Monitoring, Logging, and Integration Types — Where They're EQUAL

> ⚠️ **CloudWatch Logs and access logs are supported identically by BOTH REST API and HTTP API** — no difference here, so this is never the deciding factor between the two.

**Integration types**:
- **Lambda integration**: ✅ supported by BOTH.
- **HTTP URL integration** (calling a backend hosted on EC2 or on-premises): ✅ supported by BOTH.
- **ALB (Application Load Balancer) integration**: ⚠️ **HTTP API ONLY — REST API does NOT support routing traffic directly to an ALB.**

**Other features**:
- **Custom domain**: ✅ both.
- **CORS**: ✅ both.
- **Private API** (VPC-only access): ⚠️ **REST API (specifically REST API Private) — yes. HTTP API — NO private-only option at all.**

---

## Exam Framing

> "An API needs to validate incoming requests and reject malformed ones (e.g. a missing required field) before they ever reach the backend" → **REST API** — input validation, along with request/response transformation and mapping templates, is REST-API-exclusive. "An API needs to route traffic directly to an existing Application Load Balancer" → **HTTP API** — this is one of the rare cases where HTTP API supports something REST API does NOT. "An API must only be reachable from within a VPC, never the public internet" → **REST API Private** — HTTP API has no private-only equivalent at all. Remember the overall shape: **REST API = richer feature set (transformation, validation, caching, WAF, private access) at higher cost; HTTP API = fast, cheap pass-through, with ALB integration and native JWT/OAuth as its two specific advantages over REST API.**
`,
    },
    {
      id: "rest-api-vs-http-api-part1",
      title: "REST API vs HTTP API (Part 1) – Older + Feature-Rich vs Newer + 70% Cheaper",
      shortDesc: "REST API natively supports API keys and WAF but not modern JWT/OAuth login; HTTP API is the reverse — no API keys, but native JWT support since it was built for the modern auth landscape",
      visuals: [],
      content: `## Four API Gateway Types, Two Worth Comparing Directly

> **API Gateway supports four types: REST API, REST API Private, HTTP API, and WebSocket API.** ⚠️ **REST API Private is functionally the same as REST API, just restricted to VPC-only access instead of the public internet** — the two can be treated as one bucket for feature comparison purposes. ⚠️ **WebSocket API is fundamentally different — it keeps a connection open for real-time, bidirectional communication (like a live chat), unlike REST/HTTP API's request-response-then-close model** — so it's covered separately and can't be meaningfully compared feature-by-feature against REST/HTTP API.

**⚠️ The real decision that matters: REST API vs HTTP API** — both use the same request-response model, same HTTP protocol, same overall design style. ⚠️ **REST API offers the fuller, more advanced feature set; HTTP API offers faster, cheaper performance with a more limited feature set — specifically ~70% cheaper than REST API.**

---

## ⚠️ Authentication/Authorization Feature Comparison

| Auth Method | REST API | HTTP API |
|---|---|---|
| **API keys** (specific customers get a key to call paid/restricted APIs) | ✅ Yes | ❌ No |
| **IAM (SigV4)** — AWS resources call the API using their IAM role/permissions | ✅ Yes | ❌ No |
| **Cognito** — users log in via Cognito to get a token | ✅ Yes | ✅ Yes |
| **JWT / OAuth 2.0** (Google/Okta-style social sign-in) | ⚠️ **NOT natively supported** — REST API predates JWT/OAuth's widespread adoption; can only be added via custom Lambda logic | ✅ **Yes, natively** — HTTP API is the newer type, built with modern auth in mind |

⚠️ **The clean pattern to remember: REST API supports API keys and IAM but NOT native JWT/OAuth; HTTP API is the exact reverse — native JWT/OAuth but no API keys and no IAM SigV4.** Cognito is the one method both support.

---

## Security and Traffic Control Comparison

- **Throttling / rate limiting** (protecting the backend from traffic spikes): ⚠️ **REST API offers FULL advanced support; HTTP API supports it too, but only at a BASIC level.**
- **AWS WAF integration** (blocking SQL injection, bots, malicious requests): ⚠️ **REST API integrates with WAF DIRECTLY; HTTP API does NOT integrate directly — it can only get WAF protection indirectly, by putting CloudFront in front of it.**
- **Resource policy** (restricting access by IP, VPC, or AWS account): ✅ **supported by BOTH REST API and HTTP API equally** — no difference here.

---

## Exam Framing

> "An API needs to authenticate callers using API keys, distributed only to specific paying customers" → **REST API** — API keys are not supported by HTTP API at all. "An API needs to authenticate users via a modern JWT/OAuth flow (e.g. Google sign-in) natively, without custom Lambda authorizer logic" → **HTTP API** — REST API has no native JWT/OAuth support, only HTTP API does. "An API needs direct AWS WAF integration to block malicious traffic" → **REST API** — HTTP API only gets WAF protection indirectly via CloudFront in front of it, not a direct integration.
`,
    },
    {
      id: "api-gateway-introduction",
      title: "API Gateway – The Single Entry Point Standing Between Every Client and Every Backend API",
      shortDesc: "Clients never talk to backend APIs directly — every request hits the gateway first, which decides who gets through, how much traffic is allowed, and where the request actually goes",
      visuals: [],
      content: `## ⚠️ The Problem: Managing Many APIs Individually Doesn't Scale

> **A real application typically has MANY separate APIs — one per feature — and managing each one individually (security, throttling, logging, versioning) becomes genuinely difficult as the number grows.** ⚠️ **API Gateway solves this by acting as ONE central entry point for ALL of an application's APIs**, rather than exposing each backend API directly to clients.

---

## What API Gateway Actually Is

> **A fully managed AWS service that sits as the single entry point in front of all backend APIs.** ⚠️ **Clients (web apps, mobile apps, other microservices) never connect directly to a backend API — every request must go THROUGH the API Gateway first.** The gateway inspects the request, then forwards it to the correct backend (which can be EC2, Lambda, ECS, or any other compute target).

**⚠️ The "security guard + traffic controller + manager" analogy**: API Gateway decides who's allowed in, how many requests can come through at once, who should be blocked, what gets logged, and how traffic overall is controlled — ⚠️ **all without writing any custom code for these concerns; it's handled entirely by the managed service itself, with zero infrastructure to provision.**

---

## ⚠️ Worked Example: Ola/Uber's Rider and Driver Apps

> **A ride-hailing platform has many distinct backend APIs**: driver location, rider request, fare calculation, payment, trip history, notifications — ⚠️ **all used by both the rider app AND the driver app.** ⚠️ **Rather than exposing each API separately, ONE API Gateway sits in front of all of them**, providing: centralized security for every API, fine-grained control over who can access which specific API, throttling during peak-hour traffic spikes, blocking of suspicious requests, and centralized version management.

---

## Exam Framing

> "An application has 10+ separate backend APIs, each needing its own security, throttling, and logging configured individually" → **API Gateway** — a single managed entry point that centralizes security, traffic control, and logging for every backend API, eliminating the need to build and maintain this logic separately for each one. Remember: **the client never talks to the backend API directly — API Gateway is always the first stop**, deciding whether and how the request reaches its actual destination.
`,
    },
    {
      id: "synchronous-vs-asynchronous-communication",
      title: "Synchronous vs Asynchronous Communication – The Core Split Behind Every AWS Integration Service",
      shortDesc: "Payment MUST be synchronous because the order can't decide what to do next without knowing the result — notification MUST be asynchronous because nothing downstream depends on when the email actually arrives",
      visuals: [],
      content: `## ⚠️ The Fundamental Split: Does the Sender Need to Wait?

> **Every AWS application integration service exists to serve one of two communication styles — synchronous or asynchronous.** ⚠️ **The single deciding question: does the sending service's NEXT STEP depend on the receiving service's response?** If yes → synchronous. If no → asynchronous.

---

## Synchronous Communication: Wait for the Reply Before Continuing

> **One service sends a request and WAITS until the other service replies — just like a phone call: ask a question, stay on the line until you get an answer.** ⚠️ **The sender's next decision genuinely depends on the reply.**

**⚠️ Worked example — payment processing**: when a user clicks "Pay," the order service sends a request to the payment service and MUST wait for the result. ⚠️ **The order service literally cannot proceed without knowing whether the payment succeeded or failed** — success means show dispatch information, failure means show a retry-payment page. There is no valid next step until the answer arrives.

**When to use synchronous**: an instant response is genuinely needed, the next action depends directly on the previous answer, or the operation is critical enough that immediate confirmation is required. ⚠️ **AWS services**: API Gateway and Application Load Balancer (ALB already covered elsewhere — application integration specifically focuses on API Gateway).

---

## Asynchronous Communication: Send and Move On, No Waiting

> **One service sends a message and immediately continues its own work — the receiving service processes it whenever it's free, with no blocking.** ⚠️ **Just like sending a WhatsApp message: send it, keep doing other things, the reply (if any) comes later, on its own schedule.**

**⚠️ Worked example — payment success notification**: once payment succeeds, the payment service sends a "payment successful" message (via SQS, SNS, or EventBridge) and moves on immediately — ⚠️ **it does NOT wait for the notification service to actually send the email/SMS.** ⚠️ **Some delay before the email arrives (seconds, or even 30+ minutes) is completely acceptable, because nothing downstream is blocked waiting on it** — the payment flow itself already completed independently of when the notification actually gets delivered.

**When to use asynchronous**: background tasks, notifications (email/SMS), inventory updates, event logging (payment success/failure events), retry logic — ⚠️ **anywhere the next step genuinely does NOT depend on this specific step's outcome or timing.** ⚠️ **AWS services**: SQS, SNS, EventBridge (each with its own distinct use case, covered in depth in upcoming topics).

---

## Exam Framing

> "An order service needs to know immediately whether a payment succeeded before deciding what page to show the user next" → **synchronous communication** — the next step is directly dependent on this specific response, so the caller must wait; API Gateway is the AWS service for this. "A payment service needs to trigger a confirmation email, but the email doesn't need to arrive instantly and nothing else is blocked waiting for it" → **asynchronous communication** — SQS, SNS, or EventBridge, since the sender can move on immediately without waiting for the notification to actually be delivered. The single litmus test in both cases: **does the sender's next action depend on this specific reply?**
`,
    },
    {
      id: "microservices-architecture-and-need-for-integration",
      title: "Microservices Architecture – Independent Scaling, and Why Separation Forces Application Integration",
      shortDesc: "Splitting cart, checkout, and payment into separate services means each can scale to its own actual demand — but it also means they can no longer just call each other's functions or share a database",
      visuals: [],
      content: `## What Microservices Architecture Actually Means

> **Microservices architecture breaks an application into small, independent services, each responsible for ONE specific function — developed, deployed, and scaled SEPARATELY.** ⚠️ **This is a loosely coupled design, the direct opposite of monolithic's tightly coupled single unit.** ⚠️ **Each microservice can have its own database, and can even be written in a different programming language** — Amazon's cart service and checkout service, for example, need not share a database or a language at all.

**Worked example — Amazon.com's actual internal structure**: separate services for user login/account, product catalog, cart (add/remove items), checkout flow, payment/transactions, order creation/tracking, delivery, and notifications — ⚠️ **each independently built, deployed, and scaled**, even though the end user experiences it as one seamless website.

---

## The Core Benefits

- **Independent scaling** — the single biggest advantage, especially at Amazon's scale.
- **Faster deployment** — small, focused codebases deploy far more easily than one giant application.
- **Independent teams** — separate teams own separate services; an Amazon engineer working on cart service typically has no involvement in payment service.
- **Easier to manage and troubleshoot** — small, focused codebases are simpler to reason about than one massive one.
- **Technology flexibility** — different services can use different languages/frameworks as best fits each one's needs.

---

## ⚠️ Solving the Monolith's Scaling Waste, Directly

> **Using the SAME funnel example from the earlier monolithic topic** (100,000 browsers → 10,000 cart adds → 4,000 checkouts → 2,000 payments): ⚠️ **in microservices architecture, EACH service scales independently to match its OWN actual demand** — the product service scales aggressively for 100,000 requests, while the payment service only needs capacity for 2,000. ⚠️ **No component is ever over-provisioned to match a different component's traffic** — directly eliminating the wasted-resource problem that defines monolithic scaling.

---

## ⚠️ The New Problem This Creates: How Do Separated Services Communicate?

> **Once services are genuinely separate applications — different codebases, different databases, potentially different languages — they can no longer simply call each other's functions or query each other's database directly, the way components inside one monolith could.** ⚠️ **But they still MUST communicate**, since a real user flow spans multiple services: adding to cart is the cart service's job, but creating an order requires the order service to ask the cart service what was actually selected; the payment service then needs that same cart information to charge the customer correctly.

**⚠️ This is precisely the gap application integration services exist to fill** — since normal in-process function calls and shared databases are no longer options, microservices instead communicate through APIs, queues, events, and messages.

---

## Two Communication Requirement Types

> **Synchronous communication** (real-time, caller waits for a response) — handled by services like **API Gateway, ALB, HTTP, gRPC.** **Asynchronous communication** (fire-and-forget, just informing another service without waiting) — handled by services like **SQS, SNS, EventBridge, Amazon MQ, Step Functions.** ⚠️ **Choosing which type fits a given inter-service interaction is exactly what the rest of this application integration section covers.**

---

## Exam Framing

> "Why can't two microservices in a modern application simply call each other's internal functions the way components inside a monolith could?" → **because they are genuinely separate applications — different codebases, different (possibly different-language) runtimes, and typically different databases — with no shared in-process call path between them.** "An e-commerce app needs its product-browsing service to handle 100,000 concurrent requests while its payment service only ever needs to handle 2,000" → **microservices architecture, specifically because each service scales independently based on its own actual demand** — directly solving the wasteful all-or-nothing scaling monolithic architecture forces.
`,
    },
    {
      id: "monolithic-architecture",
      title: "Monolithic Architecture – Why Scaling for 100,000 Visitors Means Wastefully Scaling Payment Too",
      shortDesc: "A funnel drops from 100,000 browsers to 2,000 buyers, but a monolith scales the ENTIRE app — including payment — for all 100,000, since everything runs as one inseparable unit",
      visuals: [],
      content: `## What "Monolithic" Actually Means

> **Monolithic (tightly coupled) architecture means every component — UI, business logic, authentication, payment, notifications, database access — is built, deployed, and scaled together as ONE single unit.** ⚠️ **One codebase, one deployment package (e.g. a single WAR/JAR file or Docker image), and typically one shared database.** This was the standard way of building applications before cloud-native microservices became practical.

---

## ⚠️ Problem 1: You Can't Update or Redeploy One Piece Alone

> **Even a small change to ONE feature (e.g. the checkout process) requires redeploying the ENTIRE application** — there's no way to update just the checkout logic in isolation, since everything ships as a single deployable unit.

---

## ⚠️ Problem 2: Scaling Is All-Or-Nothing, Even When Demand Isn't

> **The core scaling problem: different parts of an application experience wildly different traffic volumes, but a monolith can only scale as ONE unit — so the least-used component still gets scaled to match the MOST-used one.**

**⚠️ Worked example — a realistic e-commerce traffic funnel**: 100,000 users browse products in an hour → only ~10% (10,000) add something to cart → only ~4% of the original (4,000) reach checkout → only ~2% of the original (2,000) actually complete payment. ⚠️ **In a monolith, since everything runs as one inseparable unit, the ENTIRE application — including the payment system that only 2,000 people actually use — must be scaled to handle all 100,000 visitors.** The payment service ends up provisioned for 50x more capacity than it will ever actually use.

**⚠️ Direct consequences**: more compute resources than genuinely needed, higher cost, longer deployment times, and — combined with Problem 1 — even a single small change forces a full redeploy of everything.

---

## Exam Framing

> "An application's checkout/payment component is massively over-provisioned relative to its actual usage, purely because the product-browsing component needs that much capacity" → **this is the classic monolithic scaling problem** — every component scales together as one unit, so the busiest component (browsing) forces every other component (however lightly used) to match its capacity. This exact wasteful-resource pattern is the primary motivation for microservices architecture (covered in the next topic), where each component scales independently based on its own actual demand.
`,
    },
    {
      id: "app-integration-basics",
      title: "Application Integration Basics – Application-to-Application vs Microservices-to-Microservices",
      shortDesc: "UPI payments and flight booking sites are app-to-app integration between separate companies; Amazon's cart/checkout/notification split is microservices-to-microservices integration within one company",
      visuals: [],
      content: `## What Application Integration Actually Solves

> **Application integration is what lets two or more applications or microservices communicate and exchange data reliably** — sending information, receiving responses, and triggering actions across systems, ⚠️ **even when those systems are built on completely different technologies.** The core value: multiple independent systems working together as one seamless experience, without the end user ever noticing the handoffs.

---

## Type 1: Application-to-Application Integration

> **Two entirely SEPARATE applications or systems (often built by different companies) communicate to complete a task.** ⚠️ **Common whenever different companies, departments, or independently-built systems need to work together.**

**Worked example 1 — UPI payment**: scanning a QR code to pay via Google Pay or Paytm actually involves ⚠️ **THREE separate systems communicating**: the UPI app itself (built by a private company), NPCI (the government body managing UPI payment rails), and the bank's own system. All three exchange data to complete a single payment — pure application-to-application integration across three independently-operated organizations.

**Worked example 2 — flight booking aggregators**: booking a flight through Skyscanner (or Goibibo/MakeMyTrip) involves the aggregator (Skyscanner) talking directly to the airline's own system (e.g. Emirates) — first to fetch fare/schedule details, then again to actually confirm the booking on the airline's side. ⚠️ **Two distinct companies' systems, integrated so the user experiences it as one continuous booking flow.**

---

## Type 2: Microservices-to-Microservices Integration

> **Small, independent services INSIDE ONE application talking to each other to fulfill a single user request.** ⚠️ **Each microservice deliberately does exactly ONE job — meaning they MUST communicate with each other to function as a complete system**, since no single microservice can fulfill an entire user request alone.

**Worked example — Amazon.com's internal architecture**: from the outside, Amazon.com looks like one website. Internally, ⚠️ **the product page, the cart, checkout/payment, and order notifications are all separate microservices** — adding an item to cart means the product service talks to the cart service; placing an order means the order service talks to the payment service, then the notification service to send an update. ⚠️ **This is the modern replacement for the older monolithic application model**, where all of this logic would have lived in one single deployable unit instead.

---

## Exam Framing

> "Two completely separate companies' systems (e.g. a payment app and a bank) need to communicate to complete a transaction" → **application-to-application integration** — distinct organizations, distinct systems, integrated to appear seamless to the end user. "Within a single e-commerce application, the cart service needs to notify the payment service once an order is placed" → **microservices-to-microservices integration** — independent services inside ONE application, each doing one job, that must talk to each other to complete the overall request. Both types are what AWS's application integration services (API Gateway, SQS, SNS, EventBridge — covered next) exist to implement reliably.
`,
    },
    {
      id: "sqs",
      title: "SQS – Simple Queue Service",
      shortDesc: "Managed message queuing (async decoupling)",
      visuals: ["SQSConcept", "SQSComponents", "StandardVsFIFO", "QueueConfig", "VisibilityTimeout", "PollingModes", "DLQRedrive", "FIFODedup", "FIFOThroughput", "SQSIntegrations"],
      content: `## SQS – Simple Queue Service

**SQS** is a managed queue for **asynchronous** communication. A producer drops a message and **moves on**; the queue **buffers** it so a slow/down consumer never blocks the producer or loses work. (vs synchronous = API Gateway, where the caller waits.) Solves traffic spikes, reliability, background processing.

---

## Core Components & Pull Model

- **Producer** — sends (pushes) messages, then continues.
- **Queue** — AWS-managed store; doesn't process.
- **Message** — the work/instructions.
- **Consumer** — pulls, processes, then **deletes** messages.

> **Pull-based:** SQS never pushes — consumers **poll**. One message → one consumer at a time; multiple consumers can poll the same queue but won't get the same message.

---

## Standard vs FIFO

| Aspect | Standard | FIFO |
|---|---|---|
| Ordering | Not guaranteed | Strict (FIFO) |
| Delivery | At-least-once (duplicates possible) | Exactly-once |
| Throughput | Virtually unlimited | 300/s (3,000/s batched) |
| Use case | Emails, notifications, logs | Payments, inventory, order states |

> FIFO names must end in \`.fifo\`.

---

## Queue Configuration

- **Message Retention** — 1 min–14 days (default 4 days).
- **Delivery Delay** — hide a new message 0–15 min (e.g. "cancel within 2 minutes").
- **Max Message Size** — 1 KB–1024 KB (large payloads → store in S3, send a reference).

---

## Visibility Timeout

When a consumer pulls a message, SQS makes it **invisible** for the timeout (default 30s, max 12h) so no one else grabs it. Finish + delete in time → done; crash/too slow → it reappears for retry.

> **Rule:** set visibility timeout **greater than** the consumer's processing time, or a second consumer reprocesses it → **duplicate**.

---

## Polling

**Receive Message Wait Time:**
- **Short polling (0s, default)** — returns immediately even if empty → more empty responses, higher cost.
- **Long polling (1–20s)** — waits for a message before returning → fewer empty responses, lower cost. Recommended.

---

## Dead-Letter Queue (DLQ)

A poison message keeps reappearing → infinite retry loop. A **DLQ** is a separate queue where messages land after **maxReceiveCount** failed attempts → main queue stays clean; use the DLQ to debug/replay.

> **Redrive Allow Policy** (set on the DLQ) restricts which source queues may use it (allow all / deny all / by queue).

---

## FIFO: Deduplication & Message Groups

- **Content-Based Deduplication** — ON: AWS hashes the body (identical bodies within 5 min rejected); OFF: producer supplies a **MessageDeduplicationId**.
- **MessageGroupId** — tags messages that belong together; same group = strict order, different groups = parallel. Required for FIFO.
- **Deduplication Scope** — Message Group (within each group; faster, default) vs Queue (across the whole queue; slower — e.g. globally-unique transaction IDs).

## FIFO Throughput

- **Per Queue** — fixed 300/s (3,000/s batched). Predictable; for limited backends.
- **Per Message Group ID** — scales with the number of groups (parallel). Highly scalable; for pipelines that scale end-to-end.

> **High-Throughput FIFO** auto-selects scope = Message Group + limit = Per Message Group ID. No price difference.

---

## Integrations (Exam Scenarios)

Producers: Lambda, EC2, ECS, EKS, **S3, SNS, EventBridge** (these three can't consume). Consumers: Lambda, EC2, ECS, EKS. Manage/monitor: **IAM, CloudWatch, KMS**.

- **EC2 workers + Auto Scaling** — scale the ASG on **queue depth** (\`ApproximateNumberOfMessagesVisible\`), **not CPU** (CPU stays low while a backlog builds).
- **Lambda consumer** — Lambda doesn't poll; **Event Source Mapping** (owned by Lambda) polls SQS in batches & invokes it; scales automatically.
- **S3 → SQS → Lambda** — S3 event notification → SQS → Lambda; SQS buffers spikes, prevents lost tasks, "upload first, process later".
- **Priority** — SQS has no in-queue priority; use **two queues** (paid/free). EC2: poll paid first; Lambda: two functions with **reserved concurrency** (paid 100, free 10).`,
    },
    {
      id: "sns",
      title: "SNS – Simple Notification Service",
      shortDesc: "Pub/sub messaging, fan-out and notifications",
      visuals: ["PubSubModel", "SNSComponents", "StandardVsFIFOTopic", "TopicConfig", "FanOut", "FilterPolicy", "DataProtectionPolicy"],
      content: `## SNS – Simple Notification Service

**SNS** is a managed **publish/subscribe** service: one message is **pushed** instantly to many subscribers. The **publisher** doesn't know the subscribers; subscribers listen to a **topic** → fully decoupled.

> **SNS vs SQS:** SNS **pushes** to many subscribers at once (pub/sub); SQS holds messages for **one** consumer to **pull** later (queue).

---

## Core Components

- **Publisher** — sends an event to a topic (EC2, ECS, Lambda, API Gateway, SDK/CLI). Knows only the topic.
- **Topic** — the broadcast hub you create; distributes each message to all subscribers.
- **Subscriber** — registers to a topic. AWS: Lambda, SQS, Kinesis Firehose. External: HTTP/HTTPS, email, SMS, mobile push.

> A subscriber must **confirm** its subscription (e.g. email link) before receiving messages — stays *Pending* until then.

---

## Standard vs FIFO Topic

| Aspect | Standard | FIFO |
|---|---|---|
| Ordering | Not guaranteed | Strict |
| Delivery | At-least-once | Exactly-once |
| Throughput | Very high | Lower |
| Subscribers | SQS, Lambda, HTTP, email, SMS… | **Only SQS FIFO** |

> Biggest catch: a **FIFO topic** can only fan out to **SQS FIFO queues**. Standard for notifications; FIFO when order matters.

---

## Topic Configuration

- **Encryption** (KMS, at rest), **Access Policy** (resource-based, cross-account), **Delivery Status Logging** (to CloudWatch), **Delivery Retry Policy** (HTTP/S retries & backoff), **Active Tracing** (X-Ray), **Tags**.

---

## Fan-Out (SNS + SQS)

One message → an SNS topic → fanned out to **multiple SQS queues** (and other subscribers). Each queue's consumer processes independently.

> Why SNS→SQS (not SNS direct)? The **queue buffers** each message → durability, retries, DLQs, consumers can be down without losing data. SNS broadcast + SQS reliability. For ordered fan-out: **FIFO topic → FIFO queues**.

---

## Subscription Filter Policy

Without a filter, every subscriber gets every message. A **filter policy** (JSON on the subscription) matches **message attributes** so each subscriber only gets relevant messages (route by type/region/priority) → saves cost & processing.

---

## Data Protection Policy

Scans messages for **sensitive data / PII** (emails, phone numbers, card numbers) and can **audit**, **mask/redact**, or **block** them before delivery — helps meet compliance (GDPR, PCI).`,
    },
    {
      id: "eventbridge",
      title: "EventBridge",
      shortDesc: "Serverless event bus & scheduler",
      visuals: ["EventBridgeConcept", "EventBridgeWorkflow", "EventRule", "EventBridgeScheduler", "EventBridgeCheatSheet"],
      content: `## Amazon EventBridge

A **serverless event bus** for **event-driven architecture** — "when X happens, do Y" — connecting AWS services, your apps, and SaaS apps via events. It's the evolved **CloudWatch Events** (now separate, with SaaS integration, custom buses, schema registry). *Exam focus: AWS-service workflows.*

---

## Core Workflow

**Source → Event → Event Bus → Rule → Target**
- **Event Source** — emits an event (e.g. EC2). AWS services emit automatically (no enable/disable).
- **Event** — a state change in JSON (e.g. \`state: stopped\`); each occurrence is new; max 256 KB.
- **Event Bus** — central hub. Types: **default** (AWS events), **custom** (your apps), **partner** (SaaS).
- **Rule** — filter + decision-maker (event pattern). No rule = no action. One rule → multiple targets.
- **Target** — Lambda, SNS, SQS, Step Functions, Kinesis, ECS… EventBridge needs an **IAM role** to invoke it.

> The **Schema Registry** shows an event's JSON structure to help build rules.

---

## Event Pattern Rule

JSON filter:
- **Simple** — \`{"source":["aws.ec2"]}\` matches any EC2 event.
- **Detailed** — also match \`detail-type\`, \`state\`, specific \`instance-id\` for precise triggering.

---

## EventBridge Scheduler

Time-based (cron in the cloud) — the modern replacement for legacy schedule rules:
- **Rate** — fixed interval (\`rate(5 minutes)\`).
- **Cron** — specific times (every day 10 PM).
- **One-time** — run once at an exact date/time (new).

Targets: Lambda, EC2 start/stop, Step Functions, SNS, SQS, API calls. Needs an IAM role trusting \`scheduler.amazonaws.com\`. Use cases: cost optimization, maintenance, ETL, reminders.

---

## Exam Cheat Sheet

- *event happens → action, no polling, serverless, real-time* → **EventBridge**
- *route/filter by JSON content* → **EventBridge Rule**
- *run job at a time / cron / stop EC2 at night* → **EventBridge Scheduler**
- *content/JSON filtering, advanced routing* → **EventBridge** (vs **SNS** = broadcast/fan-out)
- *understand event structure* → **Schema Registry**`,
    },
    {
      id: "step-functions-concept",
      title: "AWS Step Functions – Orchestrating Multiple Lambdas Into a Sequenced Workflow",
      shortDesc: "Worked through an e-commerce payment→inventory→email chain — why one giant function with nested if/else doesn't scale as well as a visual state machine",
      visuals: [],
      content: `## The Problem: Orchestrating Multiple Lambda Functions

> **Real workflows often need multiple Lambda functions to run in a specific, conditional sequence** — not run once each independently, but run **one after another, based on each step's success or failure.**

**Worked example — an e-commerce order flow**:
1. **Lambda 1** — verify payment status.
2. **If payment succeeds** → **Lambda 2** — verify inventory availability.
3. **If inventory is available** → **Lambda 3** — send a confirmation email.
4. **If payment FAILS instead** → a different function (Lambda X) runs, sending the customer a "payment unsuccessful, retry here" email.

⚠️ **The challenge**: how do you connect these functions into a proper flow, guarantee Lambda 2 only runs after Lambda 1 succeeds, and branch to a different path entirely on failure — all without writing one giant, deeply-nested function?

---

## What Step Functions Actually Is

> **AWS Step Functions is a serverless service for connecting and managing multiple tasks in a defined flow** — built as a **state machine**, a step-by-step visual diagram where each step performs a specific action (checking payment, updating an order, sending an email). It controls execution order, makes branching decisions based on each step's result, and handles failure/retry logic — **all without custom orchestration code.**

⚠️ **Step Functions is not limited to Lambda** — it can coordinate Lambda, SQS, SNS, and many other AWS services within the same workflow.

---

## Why Not Just Write One Big Function?

> **Technically possible, but not recommended**: cramming payment-check → inventory-check → email-send logic into a single Lambda function means deeply nested if/else conditions, increasingly complex code, and a violation of clean microservices-style separation of concerns. **Step Functions lets each concern stay its own small function, while the orchestration logic (order, branching, retries) lives declaratively in the state machine itself**, not buried in nested conditionals.

---

## Building a State Machine

> **A state machine can be defined two ways: visually (drag-and-drop GUI) or in code (Amazon States Language — JSON or YAML).** Both produce the same underlying workflow; the GUI is simply a visual editor over the same JSON/YAML definition.

**Basic shape of the e-commerce example**: Start → invoke "check payment" Lambda → (if successful) invoke "prepare order" Lambda → (if inventory available) invoke "send email" Lambda → End. Each arrow in the visual editor represents a transition, and branching logic (different paths based on a step's output) is expressed directly in the diagram.

---

## Five Advantages of Step Functions

1. **Connects multiple services** — Lambda, SQS, SNS, and others, within one coordinated flow.
2. **Reduces complex code** — flow logic lives in the state machine, not as nested if/else inside one function.
3. **Visual workflow** — easy to monitor and debug, since the actual execution path is visible as a diagram, not buried in code.
4. **Built-in error handling and retry support** — without hand-writing retry logic inside each function.
5. **Good for automation and microservices communication** — a natural fit for coordinating several small, single-purpose functions rather than one monolithic one.

---

## Exam Framing

> "Coordinate multiple Lambda functions (or other AWS services) with retries, conditional branching, and sequencing, without writing custom orchestration logic" → **Step Functions.** Contrast this against EventBridge, which routes individual events to targets but does not manage multi-step, conditional, stateful workflows the way Step Functions does.
`,
    },
    {
      id: "step-functions-lab",
      title: "Step Functions Lab – Sequencing Three EC2-Starting Lambda Functions With Wait States",
      shortDesc: "Ad server → wait 2 min → DB server → wait 2 min → app server — built entirely with drag-and-drop, no custom orchestration code",
      visuals: [],
      content: `## The Scenario

> **Three EC2 instances — an ad server, a database server, and an application server — each have a dedicated Lambda function to start them.** ⚠️ **System administration rules require starting them in a strict sequence**: ad server first, then (after it's ready) the database server, then (after that) the application server — with a wait interval between each step.

---

## Step 1 — Provision the Environment

> The lab uses a **CloudFormation template** to provision all three EC2 instances and their three corresponding Lambda functions in one shot — avoiding the time cost of manually building each piece, so the focus stays on Step Functions itself. Deploying the stack (**Quick create stack → Acknowledge → Create**) takes a few minutes and produces all three instances (initially stopped) plus their three start-functions, ready to be orchestrated.

---

## Step 2 — Build the State Machine

1. **Step Functions → Create state machine.** Choose **Standard** (vs Express — covered in depth in the Step Function Types topic).
2. **Add a Lambda-invoke step** — name it (e.g. "Start Ad Server"), and select the corresponding Lambda function from the list.
3. **Add a Wait step** — name it, and set the duration (e.g. **120 seconds / 2 minutes**) — this pauses the state machine's execution between steps.
4. **Repeat**: add a second Lambda-invoke step ("Start DB Server"), another Wait step (another 2 minutes), then a final Lambda-invoke step ("Start App Server") with no further wait, going straight to End.

**The resulting sequence**: Start → Start Ad Server → Wait (2 min) → Start DB Server → Wait (2 min) → Start App Server → End.

5. Click **Create** to save the state machine.

---

## Step 3 — Execute and Verify

> **Click Execute → Start execution.** The state machine begins running through its defined steps, and its progress can be watched live in the console:

- The **ad server Lambda invokes first** — checking the EC2 console confirms the ad server instance transitions to Running.
- The state machine then enters the **first Wait state**, visibly counting down the configured duration before proceeding.
- Once the wait completes, the **DB server Lambda invokes** — again verifiable directly in the EC2 console.
- The **second Wait state** runs, then the **app server Lambda invokes** last, completing the full sequence.

⚠️ **This entire orchestration — strict order, timed waits between steps — required zero custom code beyond the individual Lambda functions themselves**; the sequencing and waiting logic lives entirely in the state machine definition.

---

## Cleanup

> Two things need deleting after the lab: the **CloudFormation stack** (removes the EC2 instances and Lambda functions automatically) and the **state machine itself** (created manually, so it must be deleted manually — Step Functions → State machines → select → Delete).

---

## Exam Framing

> This lab demonstrates the practical alternative to writing one large orchestration function with manual sleep/wait calls and nested conditionals: **a Wait state and a Lambda-invoke step, chained together visually**, replace what would otherwise be hand-written sequencing and timing logic. Triggers for a state machine work the same way as for a standalone Lambda function — API Gateway, EventBridge schedule, or manual execution are all valid entry points.
`,
    },
    {
      id: "step-functions-standard-vs-express",
      title: "Step Functions: Standard vs Express Workflows – Seven Points of Comparison",
      shortDesc: "Complex multi-day order-to-shipment flows need Standard; a 2-second form submission needs Express — the choice comes down to duration, volume, and cost model",
      visuals: [],
      content: `## The Core Decision: Use Case

> **The single most deciding factor between Standard and Express is the shape of the workflow itself.** ⚠️ **Complex, long-running workflows** (e.g. an e-commerce order-to-shipment-delivery flow spanning 6–7 days, with many steps) → **Standard.** ⚠️ **Short, simple, high-speed workflows** (e.g. a mobile app form submission that stores data in a database within 2–3 seconds) → **Express.**

---

## Seven Points of Comparison

**1. Maximum duration** — Standard: up to **1 year** per execution. Express: capped at **5 minutes.**

**2. Execution start rate** — Standard: up to **2,000 workflow starts per second.** Express: up to **100,000 workflow starts per second** — dramatically higher, matching its use case of many small, fast, high-volume executions.

**3. Pricing model** — ⚠️ **Standard bills per state transition**: each step in the workflow is a "transition," and AWS charges per 1,000 transitions (e.g. a 3-step workflow run 1,000 times = 3,000 transitions billed). ⚠️ **Express bills per request, duration, AND memory usage** — a more granular, Lambda-like cost model:
   - **Request**: each workflow start (even from the console) counts as one request.
   - **Duration**: from start to end/failure, ⚠️ **rounded up to the nearest 100ms** (e.g. 350ms actual duration bills as 400ms).
   - **Memory**: billed in **64MB chunks**, even though memory isn't explicitly assigned — AWS tracks actual consumption and rounds up (e.g. 90MB actual usage bills as 120MB).

**4. Execution history** — Standard: full execution history is **stored for 90 days** directly within Step Functions. Express: ⚠️ **no execution history stored within Step Functions itself** — logs must be explicitly sent to **CloudWatch Logs** if that visibility is needed.

**5. Retry and error handling** — Standard: extensive built-in support (timeouts, retries, multiple error-handling patterns) — appropriate given how complex Standard workflows tend to be. Express: more limited support, adequate for simple flows but not built for the same depth of failure-handling logic.

**6. Tracing and debugging** — Standard: excellent, detailed step-by-step tracking out of the box. Express: basic by default, improved significantly once CloudWatch logging is explicitly enabled.

---

## Exam Framing

> "Long-running (up to a year), complex, low-to-moderate-volume workflow needing detailed execution history and rich error handling" → **Standard.** "Short (under 5 minutes), extremely high-volume workflow where per-request/duration/memory billing and 100,000 starts/sec throughput matter most" → **Express.** ⚠️ **The pricing-model contrast is the most distinctive testable fact** — Standard's simple per-transition billing vs Express's Lambda-like per-request/duration/memory billing.
`,
    },
    {
      id: "kinesis",
      title: "Kinesis",
      shortDesc: "Real-time data streaming",
      visuals: ["BatchVsRealtime", "KinesisFamily", "KinesisTerminology", "StreamVsFirehose"],
      content: `## Amazon Kinesis

### Data Processing: Batch vs Real-Time

- **Batch** — collect data, process later in one go. Slower but easy & cheap. e.g. **NEFT** (~30-min cycles); reports, billing, salary.
- **Real-time** — process each item instantly as it arrives. Fast but complex & costly. e.g. **UPI** (instant); payments, tracking, alerts.

> Prefer batch when possible; use real-time when you need instant results — Kinesis makes it easy.

---

## Kinesis Family

Umbrella for real-time streaming:
- **Data Streams** — collect & store streaming data for consumers to read (core ingestion).
- **Data Firehose** — process & deliver to destinations (S3, Redshift, OpenSearch, Splunk) — no code.
- **Managed Apache Flink** — process & analyze streams (formerly Kinesis Data Analytics).

---

## Data Streams Terminology

**Producer → Stream (shards) → Consumer**
- **Producer** — sends data (e.g. Uber driver app).
- **Record** — one piece of data (JSON); one update = one record.
- **Stream** — the live pipeline you create.
- **Shard** — a "lane"; more shards = more throughput (set at creation).
- **Sequence Number** — unique number Kinesis auto-assigns for ordering.
- **Consumer** — reads & processes (live tracking, fare, fraud, dashboards).

> Highway = stream, lane = shard, one cab update = record.

---

## Data Streams vs Firehose

| Aspect | Data Streams | Firehose |
|---|---|---|
| Purpose | Collect & store | Deliver to destinations |
| Code | Write your own consumer | No code, pre-configured |
| Destinations | Any | S3, Redshift, OpenSearch, Splunk |
| Management | You manage shards | Fully managed |

> Flow: **Producer → Stream → Firehose → S3/Redshift**. **Firehose** = a no-code mediator from a stream to a destination.

> **Interface VPC Endpoint** (PrivateLink) keeps producer↔Kinesis traffic on AWS — no internet/NAT/IGW. (S3 & DynamoDB use gateway endpoints; Kinesis uses an interface endpoint.)`,
    },
  ],
};
