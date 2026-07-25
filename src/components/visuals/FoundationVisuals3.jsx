import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./FoundationVisuals.css";
import "./FoundationVisuals2.css";
import "./FoundationVisuals3.css";

/* ─── 1. LAB — CREATE A FREE TIER ACCOUNT ──────────────────────────── */
export function FreeTierAccountLab() {
  return (
    <LabStepper
      title="🧪 Lab — Create Your AWS Free Tier Account"
      intro="All you need is a laptop or desktop. Follow along; the whole thing takes about ten minutes."
      steps={[
        {
          label: "0 · Prepare",
          screen: "Before you begin",
          detail: [
            "An email account — Gmail or Yahoo is fine.",
            "A credit or debit card that is Visa, Mastercard or American Express.",
            "International transactions must be ENABLED on that card. Check in your bank's mobile app — you can usually switch it on there.",
          ],
          warn: "An Indian-Rupee-only card will NOT be accepted.",
        },
        {
          label: "1 · Sign up",
          screen: "aws.amazon.com/free",
          detail: [
            "Search Google for AWS free tier account and open the first result (Amazon Web Services).",
            "Scroll down to see exactly what the free tier includes.",
            "Click Create Free Account.",
          ],
        },
        {
          label: "2 · Email",
          screen: "Sign up for AWS — root user email",
          detail: [
            "Enter your email address. Copy and paste it rather than typing, so there is no chance of a typo.",
            "Enter an AWS account name — your own name or a company name.",
            "Click Verify email address. AWS sends a code.",
            "Open your inbox, copy the verification code, paste it back, and click Verify.",
          ],
        },
        {
          label: "3 · Password",
          screen: "Create your root user password",
          detail: [
            "Set the root user password.",
            "Make it complex — uppercase, lowercase, numbers and symbols.",
            "Click Continue.",
          ],
          note: "This is the ROOT user — the most powerful identity in the account. Treat the password accordingly.",
        },
        {
          label: "4 · Contact",
          screen: "Contact information",
          detail: [
            "Choose Personal for a learning account.",
            "Enter your full name, then select your country and enter your mobile number.",
            "Enter your address — street, city, state and postal code.",
            "Tick the agreement checkbox and click Continue.",
          ],
        },
        {
          label: "5 · Card",
          screen: "Billing information",
          detail: [
            "Enter your Visa, Mastercard or American Express card number.",
            "Enter the cardholder name and the CVV from the back of the card.",
            "When asked whether to use your PIN, you can decline — do not enter a PIN.",
            "Click Verify and Continue.",
            "Enter the OTP sent to your mobile to confirm the transaction.",
          ],
          note: "AWS charges roughly ₹2 purely to verify the card is active. In India it is credited back within a day or two. There is no automatic deduction later — even when a bill exists, you pay it deliberately.",
        },
        {
          label: "6 · Verify",
          screen: "Confirm your identity",
          detail: [
            "Enter your mobile number again.",
            "Type the captcha security check.",
            "Click Send SMS and enter the verification code you receive.",
            "This step can take two to five minutes.",
          ],
        },
        {
          label: "7 · Support",
          screen: "Select a support plan",
          detail: [
            "Choose the primary purpose of registration — Personal use / Individual ownership for learning.",
            "Three support plans appear: Basic (free), Developer ($29) and Business ($100).",
            "Select Basic support — it costs nothing.",
            "Click Complete sign up.",
          ],
          note: "The differences between support plans come up in the Cloud Practitioner exam, so they are worth knowing even though we pick Basic here.",
        },
        {
          label: "8 · Sign in",
          screen: "AWS Management Console",
          detail: [
            "You should see a congratulations message. An activation email arrives shortly after.",
            "Click Go to the AWS Management Console.",
            "Sign in with your email as the username, then your password.",
            "Your account is ready.",
          ],
          warn: "Do NOT start labs yet. Set a budget first — that is the very next topic.",
        },
      ]}
    />
  );
}

/* ─── 2. LAB — ZERO-SPEND BUDGET ───────────────────────────────────── */
export function BudgetSetupLab() {
  return (
    <LabStepper
      title="🧪 Lab — Set a Zero-Spend Budget"
      intro="Do this before your first lab. If you ever create a chargeable resource by accident, AWS emails you immediately."
      steps={[
        {
          label: "1 · Billing",
          screen: "Console → account name → Billing Dashboard",
          detail: [
            "Sign in to the AWS Management Console.",
            "Click your account name in the top-right corner.",
            "Choose Billing Dashboard.",
          ],
        },
        {
          label: "2 · Alerts",
          screen: "Billing preferences → Alert preferences",
          detail: [
            "Click Billing preferences.",
            "Under Alert preferences, click Edit.",
            "Tick Receive AWS Free Tier alerts.",
            "Your email is usually filled in automatically. If not, type it and click Update.",
          ],
        },
        {
          label: "3 · Template",
          screen: "Budgets → Create a budget",
          detail: [
            "Go to Budgets in the left menu.",
            "Click Create a budget.",
            "Select Use a template (simplified).",
            "Choose the Zero spend budget template.",
          ],
          note: "The zero-spend template notifies you as soon as spending exceeds $0.01 — anything above the free tier limit.",
        },
        {
          label: "4 · Recipients",
          screen: "Budget name and email recipients",
          detail: [
            "Leave the default budget name, or set your own.",
            "Enter the email address that should receive alerts.",
            "You can add several addresses — useful if you check more than one inbox.",
            "The scope covers all AWS services by default. Leave it.",
            "Click Create budget.",
          ],
        },
        {
          label: "5 · Check",
          screen: "Budgets overview",
          detail: [
            "You should receive a confirmation email that the budget is set up.",
            "The budget row shows a green OK while you are within limits.",
            "If you exceed the budget, that indicator turns red and shows an alarm.",
            "Make it a habit: every two or three days, open Billing Dashboard → Budgets and confirm it is still green.",
          ],
          warn: "A budget only ALERTS you — AWS will never delete anything for you. When an alert arrives, go and delete the resource yourself. Always clean up after every lab.",
        },
      ]}
    />
  );
}

/* ─── 2b. CONSOLE TOUR ─────────────────────────────────────────────── */
export function ConsoleTour() {
  const [spot, setSpot] = useState("services");

  const spots = {
    services: {
      name: "Services menu",
      body: "AWS has 200+ services, so they are grouped by category. Click Analytics for every analytics service, Application Integration for every integration service, Compute for EC2 and friends. Each service opens its own dashboard.",
    },
    recent: {
      name: "Recently visited",
      body: "Whatever you opened last. A heavy user sees a long list; a brand-new account shows two or three entries.",
    },
    health: {
      name: "Health dashboard",
      body: "Status of AWS data centres. If there is an issue on the AWS side rather than yours, it appears here.",
    },
    account: {
      name: "Account name → billing",
      body: "Your billing details live here, along with your Account ID — a unique number for every AWS user, which comes up repeatedly later. This is also where you generate programmatic access keys for the CLI.",
    },
    region: {
      name: "Region selector",
      body: "Top-right. Whatever you pick is where resources get created — select US East (N. Virginia) and everything you build lands there. But open IAM and the selector reads Global and cannot be changed: if you cannot pick a region, the service is global rather than regional.",
    },
    shell: {
      name: "CloudShell",
      body: "A browser-based command line — no local install needed. The alternative to installing the AWS CLI on your own machine.",
    },
  };

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">🖥️ Tour of the AWS Management Console</div>
      <p className="fnd-intro">
        Click each area of the console to see what it does.
      </p>

      <div className="fnd3-console">
        <div className="fnd3-console-bar">
          <button className={`fnd3-spot ${spot === "services" ? "on" : ""}`} onClick={() => setSpot("services")}>
            Services ▾
          </button>
          <span className="fnd3-console-spacer" />
          <button className={`fnd3-spot ${spot === "shell" ? "on" : ""}`} onClick={() => setSpot("shell")}>
            &gt;_ CloudShell
          </button>
          <button className={`fnd3-spot ${spot === "region" ? "on" : ""}`} onClick={() => setSpot("region")}>
            🌍 Mumbai ▾
          </button>
          <button className={`fnd3-spot ${spot === "account" ? "on" : ""}`} onClick={() => setSpot("account")}>
            👤 My Account ▾
          </button>
        </div>
        <div className="fnd3-console-body">
          <button className={`fnd3-panel ${spot === "recent" ? "on" : ""}`} onClick={() => setSpot("recent")}>
            <span className="fnd3-panel-title">Recently visited</span>
            <span className="fnd3-panel-hint">EC2 · S3 · IAM …</span>
          </button>
          <button className={`fnd3-panel ${spot === "health" ? "on" : ""}`} onClick={() => setSpot("health")}>
            <span className="fnd3-panel-title">Health dashboard</span>
            <span className="fnd3-panel-hint">Service status</span>
          </button>
        </div>
      </div>

      <div className="fnd3-detail">
        <div className="fnd3-detail-name">{spots[spot].name}</div>
        <p className="fnd3-detail-what">{spots[spot].body}</p>
      </div>

      <div className="fnd-note warn">
        Never share your password, and sign out of the console when you finish working.
      </div>
    </div>
  );
}

/* ─── 3. REGION vs AZ vs LOCAL ZONE ────────────────────────────────── */
export function RegionAZLocalZone() {
  const [sel, setSel] = useState("region");

  const items = {
    region: {
      name: "Region",
      what: "A geographical boundary — nothing more. AWS divided the world into regions; there are around 35, such as Mumbai (ap-south-1).",
      why: ["Low latency — host near your users", "Data residency — comply with local law"],
      inside: "Is a boundary that CONTAINS availability zones",
      colour: "region",
    },
    az: {
      name: "Availability Zone",
      what: "An actual data centre, or a collection of them. The Mumbai region has three separate data-centre facilities, each with its own electricity and water supply.",
      why: ["High availability — run across multiple AZs so one failure does not take you down"],
      inside: "Always INSIDE a region · within a ~100 km radius · linked by high-speed fibre at ~1 ms latency",
      colour: "az",
    },
    local: {
      name: "Local Zone",
      what: "Also a data centre — but placed OUTSIDE the region, in a distant city. Delhi users are ~1,300 km from the Mumbai region, so a local zone sits closer to them.",
      why: ["Low latency for users far from any region"],
      inside: "Always OUTSIDE the region · offers nearly all the same services",
      colour: "local",
    },
  };

  const it = items[sel];

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">🗺️ Region vs Availability Zone vs Local Zone</div>
      <p className="fnd-intro">
        Three terms that sound similar and are constantly confused. The distinction that matters:
        <strong> AZs live inside a region and give you high availability; local zones live outside it and give
        you low latency.</strong>
      </p>

      <div className="fnd2-tabs">
        {Object.keys(items).map((k) => (
          <button key={k} className={`fnd2-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>
            {items[k].name}
          </button>
        ))}
      </div>

      <div className="fnd3-map">
        <div className={`fnd3-region ${sel === "region" ? "hi" : ""}`}>
          <span className="fnd3-region-tag">REGION — ap-south-1 (Mumbai)</span>
          <div className="fnd3-azs">
            {["AZ-a", "AZ-b", "AZ-c"].map((az) => (
              <span key={az} className={`fnd3-az ${sel === "az" ? "hi" : ""}`}>🏢 {az}</span>
            ))}
          </div>
        </div>
        <div className={`fnd3-local ${sel === "local" ? "hi" : ""}`}>
          <span className="fnd3-local-tag">LOCAL ZONE</span>
          <span className="fnd3-local-body">🏢 Delhi — outside the region</span>
        </div>
      </div>

      <div className="fnd3-detail">
        <div className="fnd3-detail-name">{it.name}</div>
        <p className="fnd3-detail-what">{it.what}</p>
        <div className="fnd3-detail-label">Use case</div>
        <ul className="fnd2-ul">{it.why.map((w) => <li key={w}>{w}</li>)}</ul>
        <div className="fnd3-detail-pos">{it.inside}</div>
      </div>

      <div className="fnd-note">
        Running across multiple AZs <strong>does</strong> cost more — you are hosting twice. But an
        on-premises disaster-recovery site costs money too, and this buys you near-100% availability.
      </div>
    </div>
  );
}

/* ─── 4. EDGE CACHE HIERARCHY ──────────────────────────────────────── */
export function EdgeCacheHierarchy() {
  const [scenario, setScenario] = useState("hit");

  const scenarios = {
    hit: {
      name: "Edge hit",
      path: [true, false, false],
      story: "The user requests a video. The nearby edge location already has it cached, so it is served immediately. The request never travels further.",
      verdict: "Fastest possible. Origin untouched.",
      good: true,
    },
    rec: {
      name: "Edge miss → regional cache",
      path: [true, true, false],
      story: "The edge location does not have this video — edge locations have limited storage. Instead of going all the way to the origin, the request falls back to the regional edge cache, which is far larger and holds much more content.",
      verdict: "Still fast. Origin STILL untouched — this is the whole point of the extra layer.",
      good: true,
    },
    origin: {
      name: "Full miss → origin",
      path: [true, true, true],
      story: "Neither cache has the content, so the request finally reaches the origin — 13,000 km away in Mumbai. The origin does the work and the content gets cached on the way back.",
      verdict: "Slowest, and it puts load on your origin. Regional edge caches exist to make this rare.",
      good: false,
    },
  };

  const s = scenarios[scenario];
  const hops = [
    { icon: "📍", name: "Edge Location", sub: "350+ worldwide · small cache" },
    { icon: "🗄️", name: "Regional Edge Cache", sub: "~13 worldwide · large cache" },
    { icon: "🏠", name: "Origin", sub: "Your server — e.g. Mumbai" },
  ];

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">⚡ Edge Locations &amp; Regional Edge Caches</div>
      <p className="fnd-intro">
        Why OTT platforms stream 4K with no buffering: static content is cached close to you. Follow a
        request through the three layers.
      </p>

      <div className="fnd2-tabs">
        {Object.keys(scenarios).map((k) => (
          <button key={k} className={`fnd2-tab ${scenario === k ? "active" : ""}`} onClick={() => setScenario(k)}>
            {scenarios[k].name}
          </button>
        ))}
      </div>

      <div className="fnd3-hops">
        <div className="fnd3-user">👤 User<small>USA</small></div>
        {hops.map((h, i) => (
          <div key={h.name} className="fnd3-hop-wrap">
            <span className={`fnd3-arrow ${s.path[i] ? "on" : ""}`}>→</span>
            <div className={`fnd3-hop ${s.path[i] ? "on" : ""} ${i === 2 && s.path[2] ? "bad" : ""}`}>
              <span className="fnd3-hop-icon">{h.icon}</span>
              <span className="fnd3-hop-name">{h.name}</span>
              <small>{h.sub}</small>
            </div>
          </div>
        ))}
      </div>

      <div className={`fnd3-verdict ${s.good ? "ok" : "bad"}`}>
        <p className="fnd3-story">{s.story}</p>
        <strong>{s.verdict}</strong>
      </div>

      <div className="fnd-note">
        A small business cannot persuade an ISP to host its CDN — Google and Netflix can. Edge locations give
        everyone else the same capability, configured through <strong>AWS CloudFront</strong>.
      </div>
    </div>
  );
}
