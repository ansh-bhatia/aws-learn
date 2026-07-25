// Developer Tools & CI/CD
export default {
  id: "devtools",
  label: "Developer Tools & CI/CD",
  icon: "🛠️",
  color: "#1A9C3E",
  topics: [
    {
      id: "codecommit",
      title: "CodeCommit",
      shortDesc: "Managed Git repositories",
      content: `## CodeCommit

**AWS CodeCommit** is a managed, private **Git repository** service — like a hosted GitHub inside AWS. Secure (IAM, KMS encryption), scalable, integrates with the rest of the **Code\*** CI/CD suite.

- Access via HTTPS/SSH; supports pull requests, branches, triggers (→ Lambda/SNS).

> The "source" stage in an AWS-native CI/CD pipeline. (Pairs with CodeBuild → CodeDeploy → CodePipeline.)`,
    },
    {
      id: "codebuild",
      title: "CodeBuild",
      shortDesc: "Fully managed build service",
      content: `## CodeBuild

**AWS CodeBuild** is a fully managed **build service** — it compiles source, runs tests, and produces deployable artifacts. No build servers to manage; **pay per build minute**.

- Build steps defined in a **buildspec.yml**.
- Scales automatically; integrates with CodeCommit/GitHub and CodePipeline.

> The "build/test" stage of CI/CD. Serverless build → **CodeBuild**.`,
    },
    {
      id: "codedeploy",
      title: "CodeDeploy",
      shortDesc: "Automated application deployments",
      content: `## CodeDeploy

**AWS CodeDeploy** automates **application deployments** to EC2, on-prem servers, ECS, or Lambda — with strategies that minimize downtime and enable rollback.

- **Deployment styles:** **In-place** (update existing instances) and **Blue/Green** (new fleet, then switch).
- **Traffic shifting** for Lambda/ECS: **Canary** (% then rest) and **Linear** (gradual).
- Automatic **rollback** on failure (CloudWatch alarms).

> The "deploy" stage of CI/CD. Safe rollout with rollback → **CodeDeploy**.`,
    },
    {
      id: "codepipeline",
      title: "CodePipeline",
      shortDesc: "Continuous delivery pipeline",
      content: `## CodePipeline

**AWS CodePipeline** is the **CI/CD orchestrator** that ties the stages together: **Source → Build → Test → Deploy**, triggered automatically on every code change.

- Integrates **CodeCommit/GitHub → CodeBuild → CodeDeploy** (and manual-approval, CloudFormation, ECS, Lambda stages).
- Models the full release workflow; each commit flows through automatically.

> Exam: "**automate the whole release process / CI-CD pipeline**" → **CodePipeline** (the conductor; the Code\* services are the players).`,
    },
    {
      id: "cloudformation",
      title: "CloudFormation",
      shortDesc: "Infrastructure as Code (IaC)",
      content: `## CloudFormation

**AWS CloudFormation** is **Infrastructure as Code (IaC)** — you describe your AWS resources in a **template** (YAML/JSON) and CloudFormation provisions them as a managed **stack**, repeatably and consistently.

- **Declarative**: define the desired end state; CloudFormation figures out the order (dependencies).
- **Change Sets** preview updates; **automatic rollback** on failure; **drift detection**.
- Reusable across environments/regions; **StackSets** deploy to many accounts/regions.
- **Free** — pay only for the resources created.

> Exam: "**provision infrastructure repeatably / as code**, AWS-native, declarative" → **CloudFormation**.`,
    },
    {
      id: "cdk",
      title: "CDK – Cloud Development Kit",
      shortDesc: "Define cloud infra using familiar languages",
      content: `## CDK – Cloud Development Kit

**AWS CDK** lets you define infrastructure using **real programming languages** (TypeScript, Python, Java, C#, Go) instead of YAML/JSON. Your code **synthesizes into a CloudFormation template** and deploys as a stack.

- Use loops, conditions, functions & **reusable constructs** to build infra.
- Higher-level abstractions than raw CloudFormation (sensible defaults).

> CDK (code) vs CloudFormation (templates): both end up as CloudFormation stacks. Prefer real code & abstractions → **CDK**.`,
    },
  ],
};
