// Everything a customer needs to grant read-only cost access, in one place so
// the API, the portal and the chat assistant all describe the same thing.

export const ROLE_NAME = "AWSLearnFinOpsReadOnly";

// Deliberately narrow. Every action is read-only and cost-related: nothing here
// can read application data, and nothing can change anything. A short policy is
// also one a customer can actually finish reading before they approve it.
export const PERMISSION_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "ReadCostAndUsage",
      Effect: "Allow",
      Action: [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetUsageForecast",
        "ce:GetDimensionValues",
        "ce:GetTags",
        "ce:GetCostCategories",
        "ce:GetAnomalies",
        "ce:GetReservationUtilization",
        "ce:GetReservationCoverage",
        "ce:GetSavingsPlansUtilization",
        "ce:GetSavingsPlansCoverage",
      ],
      Resource: "*",
    },
    {
      Sid: "ReadOptimizationRecommendations",
      Effect: "Allow",
      Action: [
        "cost-optimization-hub:ListRecommendations",
        "cost-optimization-hub:ListRecommendationSummaries",
        "cost-optimization-hub:GetRecommendation",
        "cost-optimization-hub:GetPreferences",
        "cost-optimization-hub:ListEnrollmentStatuses",
        "cost-optimization-hub:ListEfficiencyMetrics",
      ],
      Resource: "*",
    },
    {
      Sid: "ReadAccountNamesForReporting",
      Effect: "Allow",
      Action: ["organizations:ListAccounts", "organizations:DescribeOrganization"],
      Resource: "*",
    },
  ],
};

export function trustPolicy({ platformAccountId, externalId }) {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: `arn:aws:iam::${platformAccountId}:root` },
        Action: "sts:AssumeRole",
        // Without this condition the role could be assumed by us on anyone's
        // behalf. It is the whole reason the connection is safe.
        Condition: { StringEquals: { "sts:ExternalId": externalId } },
      },
    ],
  };
}

export function cfnTemplate({ platformAccountId, externalId }) {
  return `AWSTemplateFormatVersion: "2010-09-09"
Description: Read-only cost access for AWS Learn FinOps. Creates one IAM role. Changes nothing else.

Resources:
  FinOpsReadOnlyRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: ${ROLE_NAME}
      Description: Lets AWS Learn read cost data only. Delete this stack to revoke.
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              AWS: "arn:aws:iam::${platformAccountId}:root"
            Action: "sts:AssumeRole"
            Condition:
              StringEquals:
                "sts:ExternalId": "${externalId}"
      Policies:
        - PolicyName: FinOpsReadOnly
          PolicyDocument: ${JSON.stringify(PERMISSION_POLICY)}

Outputs:
  RoleArn:
    Description: Paste this back into AWS Learn to finish connecting.
    Value: !GetAtt FinOpsReadOnlyRole.Arn
`;
}

// Plain English on purpose. Someone who has never written an IAM policy should
// be able to follow this, and should understand what they are agreeing to.
export function onboardingSteps({ platformAccountId, externalId }) {
  return {
    whatThisDoes: [
      "You create a role in your own AWS account that can read your bill and nothing else.",
      "We can only use that role if we send a secret code that AWS checks — the External ID below.",
      "We never see your password or your access keys, and we cannot change anything in your account.",
      "You can switch it off at any time by deleting the role. Nothing here needs our permission to undo.",
    ],
    externalId,
    platformAccountId,
    roleName: ROLE_NAME,
    steps: [
      {
        title: "Open CloudFormation in your AWS account",
        detail:
          "Sign in to AWS, search for CloudFormation at the top, then choose Create stack. CloudFormation is the safe way to do this: it makes exactly what the template says and nothing more.",
      },
      {
        title: "Upload the template we generated for you",
        detail:
          "Download the template below and upload it. It already has your unique External ID inside it, so there is nothing to type by hand and nothing to get wrong.",
      },
      {
        title: "Create the stack",
        detail:
          "AWS will warn you that the template creates an IAM role. That is expected — the role is the entire point. Tick the acknowledgement and choose Submit. It takes under a minute.",
      },
      {
        title: "Copy the Role ARN back here",
        detail:
          "When the stack finishes, open its Outputs tab and copy the RoleArn value. Paste it below and we will test the connection before saving it.",
      },
    ],
    revoke:
      "To disconnect, delete the CloudFormation stack in your AWS account. That removes the role, and our access stops immediately — you do not need to tell us.",
  };
}
