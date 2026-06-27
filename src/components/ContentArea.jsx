import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, CheckCircle, Circle, Cloud } from "lucide-react";
import { awsCategories, topicMap } from "../data/services";
import CloudNetworkHero from "./CloudNetworkHero";
import CategoryIcon from "./CategoryIcon";
import { PoweredByAws, ArchitectureBand } from "./AwsBrand";
import {
  VirtualizationDiagram,
  ServerTypesCards,
  HostGuestExplainer,
  AMIFlowDiagram,
  InstanceTypeExplorer,
  MultiAZDiagram,
  EC2LaunchSteps,
} from "./visuals/EC2Visuals";
import {
  ElasticIPDiagram,
  SecurityGroupSimulator,
  StatefulExplainer,
  UserDataDemo,
  InstanceProtectionDemo,
} from "./visuals/EC2Visuals2";
import {
  PlacementGroupVisual,
  TenancyComparison,
} from "./visuals/EC2Visuals3";
import {
  StorageTypesMap,
  StorageCompareTable,
  InstanceStoreVsEBS,
  StorageScenariosExplorer,
  EBSLifecycleVisual,
} from "./visuals/StorageVisuals";
import {
  EBSVolumeTypesExplorer,
  GP2vsGP3Calculator,
  SnapshotWorkflow,
  DLMPolicyVisual,
} from "./visuals/StorageVisuals2";
import {
  EFSvsEBSShared,
  EFSUseCases,
  EFSConfigExplorer,
  EFSThroughputPerformance,
  EFSLabSteps,
} from "./visuals/EFSVisuals";
import {
  FSxFileSystemSelector,
  FSxBenefits,
  ONTAPDeploymentExplorer,
  OpenZFSTimeline,
  OpenZFSvsONTAP,
  WindowsFileServerScenario,
  ActiveDirectoryFlow,
  FSxONTAPLab,
} from "./visuals/FSxVisuals";
import {
  VPCIsolationDemo,
  VPCBuildSteps,
  CIDRExplorer,
  TwoTierArchitecture,
  PrivateSubnetAccess,
  NATGatewayFlow,
} from "./visuals/VPCVisuals";
import {
  VPCPeeringDemo,
  NACLvsSecurityGroup,
  StatefulVsStateless,
  NACLRuleSimulator,
  HybridConnectivity,
  TransitGatewayMesh,
  VPCEndpointExplorer,
} from "./visuals/VPCVisuals2";
import {
  DHCPOptionSetDemo,
  VPCFlowLogExplorer,
  ManagedPrefixListDemo,
} from "./visuals/VPCVisuals3";
import {
  DNSResolutionFlow,
  FQDNAnatomy,
  DNSRecordTypes,
  RoutingPolicyOverview,
  WeightedRoutingCalculator,
  HealthCheckDemo,
  GeoproximityBias,
  FailoverDemo,
} from "./visuals/Route53Visuals";
import {
  LoadBalancerBasics,
  LBTerminology,
  LBTypeComparison,
  ALBRouting,
  CrossZoneLB,
  GatewayLBFlow,
} from "./visuals/LoadBalancerVisuals";
import {
  IngressRoutingDemo,
  GWLBArchitecture,
  ClassicLBComparison,
} from "./visuals/LoadBalancerVisuals2";
import {
  ScalingTypes,
  ASGLaunchTemplate,
  CapacityControls,
  ScalingOptions,
  DynamicScalingSim,
  MaintenancePolicy,
  TerminationPolicy,
  ScalingTimers,
} from "./visuals/AutoScalingVisuals";
import {
  ProjectBrief,
  ArchitectureBuilder3D,
  ProjectPhaseFlow,
  ResilienceTest,
  ProjectDeliverables,
} from "./visuals/CapstoneVisuals";
import {
  RootVsIAMUser,
  PolicyTypes,
  PolicyEvaluation,
  IAMEntities,
  RoleUseCases,
  AssumeRoleFlow,
  RootBestPractices,
} from "./visuals/IAMVisuals";
import {
  IAMReports,
  AWSOrganizations,
  SCPSimulator,
  IdentityCenterSSO,
} from "./visuals/IAMVisuals2";
import {
  CDNGlobe3D,
  DistributionConfig,
  OriginAccessControl,
  CacheHitMiss,
  OriginGroupFailover,
  GeoRestrictions,
  CacheInvalidation,
} from "./visuals/CloudFrontVisuals";
import {
  GlobalAcceleratorFlow,
  GAComparison,
  GAStructure,
  GAFailover,
} from "./visuals/GlobalAcceleratorVisuals";
import {
  RelationalTables,
  DeploymentComparison,
  AvailabilityOptions,
  RPORTOChooser,
  InstanceClassNaming,
  StorageAutoScaling,
  CredentialsSecurity,
} from "./visuals/RDSVisuals";
import {
  RDSConnectivity,
  DatabaseAuth,
  RDSMonitoring,
  ParameterOptionGroups,
  RDSBackups,
  RDSEncryption,
  ReadReplicaVsStandby,
  RDSAdvanced,
} from "./visuals/RDSVisuals2";
import {
  CacheFlow,
  RedisVsMemcached,
  CacheDeployment,
  ClusterMode,
  CachingStrategies,
  RestoreFromS3,
} from "./visuals/RDSVisuals3";
import {
  AuroraFeatures,
  ClusterStorage3D,
  SQLvsNoSQL,
  UPICaseStudy,
  CoreComponents,
  TableClass,
  StorageArchitecture,
  ReadConsistency,
  WriteConsistency,
  RCUCalculator,
  WCUCalculator,
  CapacityMode,
} from "./visuals/DynamoDBVisuals";
import {
  ProvisionedMode,
  WarmThroughput,
  SecondaryIndexes,
  ResourcePolicy,
  GlobalTables,
  Backups,
  ExportToS3,
  StreamsTriggers,
  DAXFlow,
  ExamCheatSheet,
  DatabaseOverview,
} from "./visuals/DynamoDBVisuals2";
import {
  ServerlessFlow3D,
  ServerlessSpectrum,
  ServerlessTradeoffs,
  LambdaVsEC2,
  FunctionAnatomy,
  AuthoringOptions,
  ExecutionRole,
  EC2Automation,
  LambdaTriggers,
} from "./visuals/LambdaVisuals";
import {
  ExecutionEnvironment3D,
  VersionsAliases,
  Concurrency,
  ReservedConcurrency,
  ProvisionedConcurrency,
  LambdaLayers,
  LambdaVPC,
} from "./visuals/LambdaVisuals2";
import {
  LeoStory,
  OSArchitecture,
  VMvsContainer3D,
  VMLimitations,
  DockerLifecycle,
  Orchestration,
  OrchestratorCompare,
} from "./visuals/ECSPrereqVisuals";
import {
  MonolithVsMicroservices,
  ECSBasics,
  ECSCluster,
  EC2vsFargate,
  ClusterInfraSetup,
  ECSAnywhere,
  ECSStorage,
  TaskVsService,
} from "./visuals/ECSVisuals";
import {
  WhyEKS,
  K8sArchitecture,
  K8sClusterServices,
  EKSClusterModes,
  NodeGroups,
  EKSRoles,
  ManageCluster,
} from "./visuals/EKSVisuals";
import {
  AppIntegration,
  MonoMicroScaling,
  SyncVsAsync,
  APIGatewayConcept,
  APITypes,
  RestVsHttp,
  WebSocketDemo,
  CRUDFlow,
} from "./visuals/APIGatewayVisuals";
import {
  EndpointTypes,
  SecurityPolicyTLS,
  ResourcesMethods,
  IntegrationTypes,
  MethodRequestSettings,
  SecurityLayers,
  APIKeysUsagePlan,
  CanaryDeployment,
  CustomDomain,
} from "./visuals/APIGatewayVisuals2";
import {
  SQSConcept,
  SQSComponents,
  StandardVsFIFO,
  QueueConfig,
  VisibilityTimeout,
  PollingModes,
  DLQRedrive,
  FIFODedup,
  FIFOThroughput,
  SQSIntegrations,
} from "./visuals/SQSVisuals";
import {
  PubSubModel,
  SNSComponents,
  StandardVsFIFOTopic,
  TopicConfig,
  FanOut,
  FilterPolicy,
  DataProtectionPolicy,
} from "./visuals/SNSVisuals";
import {
  EventBridgeConcept,
  EventBridgeWorkflow,
  EventRule,
  EventBridgeScheduler,
  EventBridgeCheatSheet,
} from "./visuals/EventBridgeVisuals";
import {
  BatchVsRealtime,
  KinesisFamily,
  KinesisTerminology,
  StreamVsFirehose,
} from "./visuals/KinesisVisuals";
import {
  DataSyncFlow,
  GatewayConcept,
  GatewayTypes,
  DataSyncVsGateway,
} from "./visuals/StorageGatewayVisuals";
import {
  ConfigVisual,
  CloudTrailVisual,
  CloudWatchVisual,
  MonitoringComparison,
  InspectorVisual,
  TrustedAdvisorVisual,
  InspectorVsTrustedAdvisor,
} from "./visuals/MonitoringVisuals";
import {
  ACMVisual,
  EncryptionKeys,
  KMSVisual,
  STSVisual,
  WAFVisual,
  CloudHSMVisual,
} from "./visuals/SecurityServicesVisuals";
import {
  SnowFamily,
  ServerMigration,
  BillingTools,
  DataTransferCost,
} from "./visuals/MigrationBillingVisuals";
import {
  ObjectVsBlock,
  S3Features,
  StorageClasses,
  ExpressOneZone,
  Versioning,
  LifecycleRules,
  AccessControl,
  IAMvsBucketPolicy,
  ObjectLock,
  S3Encryption,
} from "./visuals/S3Visuals";
import {
  SymmetricAsymmetric,
  ServerVsClientEnc,
  SSEOptions,
  KMSAccessDemo,
  SSECFlow,
  PublicAccessWays,
  BlockPublicAccess,
  BucketPolicyAnatomy,
  StaticHosting,
  CORSDemo,
  CRRDemo,
} from "./visuals/S3Visuals2";
import {
  TransferAcceleration,
  LoggingVsCloudTrail,
  RequesterPays,
  PresignedURL,
  MFADelete,
  EventNotification,
  MultipartUpload,
  VPCEndpoint,
  AccessPoints,
} from "./visuals/S3Visuals3";
import {
  ProjectArchitecture,
  ProjectRoadmap,
  HybridCluster,
  BuildImageFlow,
  EnvVarsBestPractice,
  IAMRoleVsKeys,
  ECRBridge,
  ECRvsDockerHub,
  TagMutability,
} from "./visuals/ProjectECSVisuals";
import {
  PushToECR,
  TaskDefinitionBlueprint,
  OSArchMatch,
  NetworkModes,
  TaskSizeExplorer,
  TaskRoleVsExecution,
  PlacementConstraints,
  ContainerConfig,
  ResourceLimits,
  ECSStorageExplorer,
} from "./visuals/ProjectECSVisuals2";
import {
  TaskDefPrereqs,
  CapacityProviderCalc,
  ECSTaskVsServiceCtl,
  DeploymentConfigOptions,
  RollingVsBlueGreen,
  FailureDetection,
  ServiceNetworkingALB,
  ClusterVsServiceScaling,
  TargetTracking,
  StepScaling,
} from "./visuals/ProjectECSVisuals3";

import {
  WhatIsCloud,
  CloudBenefits,
  CloudTypes,
  CloudServiceModels,
  AWSMarketShare,
  FreeTierBudget,
  GlobalInfraExplorer,
  LatencyDistance,
  CDNEdge,
} from "./visuals/FoundationVisuals";
import {
  SMEAssistantScenario,
  GenAITrilemma,
  ArchDecisions15,
  BedrockHowItWorks,
  BedrockArchitecture,
  BedrockConsoleTour,
  BedrockVsJumpStart,
  FMSelectionFactors,
  InferencePlayground,
  LengthControl,
} from "./visuals/AIVisuals";
import {
  GuardrailCapabilities,
  GuardrailSimulator,
  AutomatedReasoningFlow,
  PromptAnatomy,
  ShotPrompting,
  SystemUserPromptComposer,
  ServiceTierSelector,
  CrossRegionRouter,
} from "./visuals/AIVisuals2";

const VISUAL_MAP = {
  SMEAssistantScenario,
  GuardrailCapabilities,
  GuardrailSimulator,
  AutomatedReasoningFlow,
  PromptAnatomy,
  ShotPrompting,
  SystemUserPromptComposer,
  ServiceTierSelector,
  CrossRegionRouter,
  GenAITrilemma,
  ArchDecisions15,
  BedrockHowItWorks,
  BedrockArchitecture,
  BedrockConsoleTour,
  BedrockVsJumpStart,
  FMSelectionFactors,
  InferencePlayground,
  LengthControl,
  WhatIsCloud,
  CloudBenefits,
  CloudTypes,
  CloudServiceModels,
  AWSMarketShare,
  FreeTierBudget,
  GlobalInfraExplorer,
  LatencyDistance,
  CDNEdge,
  VirtualizationDiagram,
  ServerTypesCards,
  HostGuestExplainer,
  AMIFlowDiagram,
  InstanceTypeExplorer,
  MultiAZDiagram,
  EC2LaunchSteps,
  ElasticIPDiagram,
  SecurityGroupSimulator,
  StatefulExplainer,
  UserDataDemo,
  InstanceProtectionDemo,
  PlacementGroupVisual,
  TenancyComparison,
  StorageTypesMap,
  StorageCompareTable,
  InstanceStoreVsEBS,
  StorageScenariosExplorer,
  EBSLifecycleVisual,
  EBSVolumeTypesExplorer,
  GP2vsGP3Calculator,
  SnapshotWorkflow,
  DLMPolicyVisual,
  EFSvsEBSShared,
  EFSUseCases,
  EFSConfigExplorer,
  EFSThroughputPerformance,
  EFSLabSteps,
  FSxFileSystemSelector,
  FSxBenefits,
  ONTAPDeploymentExplorer,
  OpenZFSTimeline,
  OpenZFSvsONTAP,
  WindowsFileServerScenario,
  ActiveDirectoryFlow,
  FSxONTAPLab,
  VPCIsolationDemo,
  VPCBuildSteps,
  CIDRExplorer,
  TwoTierArchitecture,
  PrivateSubnetAccess,
  NATGatewayFlow,
  VPCPeeringDemo,
  NACLvsSecurityGroup,
  StatefulVsStateless,
  NACLRuleSimulator,
  HybridConnectivity,
  TransitGatewayMesh,
  VPCEndpointExplorer,
  DHCPOptionSetDemo,
  VPCFlowLogExplorer,
  ManagedPrefixListDemo,
  DNSResolutionFlow,
  FQDNAnatomy,
  DNSRecordTypes,
  RoutingPolicyOverview,
  WeightedRoutingCalculator,
  HealthCheckDemo,
  GeoproximityBias,
  FailoverDemo,
  LoadBalancerBasics,
  LBTerminology,
  LBTypeComparison,
  ALBRouting,
  CrossZoneLB,
  GatewayLBFlow,
  IngressRoutingDemo,
  GWLBArchitecture,
  ClassicLBComparison,
  ScalingTypes,
  ASGLaunchTemplate,
  CapacityControls,
  ScalingOptions,
  DynamicScalingSim,
  MaintenancePolicy,
  TerminationPolicy,
  ScalingTimers,
  ProjectBrief,
  ArchitectureBuilder3D,
  ProjectPhaseFlow,
  ResilienceTest,
  ProjectDeliverables,
  RootVsIAMUser,
  PolicyTypes,
  PolicyEvaluation,
  IAMEntities,
  RoleUseCases,
  AssumeRoleFlow,
  RootBestPractices,
  IAMReports,
  AWSOrganizations,
  SCPSimulator,
  IdentityCenterSSO,
  CDNGlobe3D,
  DistributionConfig,
  OriginAccessControl,
  CacheHitMiss,
  OriginGroupFailover,
  GeoRestrictions,
  CacheInvalidation,
  GlobalAcceleratorFlow,
  GAComparison,
  GAStructure,
  GAFailover,
  RelationalTables,
  DeploymentComparison,
  AvailabilityOptions,
  RPORTOChooser,
  InstanceClassNaming,
  StorageAutoScaling,
  CredentialsSecurity,
  RDSConnectivity,
  DatabaseAuth,
  RDSMonitoring,
  ParameterOptionGroups,
  RDSBackups,
  RDSEncryption,
  ReadReplicaVsStandby,
  RDSAdvanced,
  CacheFlow,
  RedisVsMemcached,
  CacheDeployment,
  ClusterMode,
  CachingStrategies,
  RestoreFromS3,
  AuroraFeatures,
  ClusterStorage3D,
  SQLvsNoSQL,
  UPICaseStudy,
  CoreComponents,
  TableClass,
  StorageArchitecture,
  ReadConsistency,
  WriteConsistency,
  RCUCalculator,
  WCUCalculator,
  CapacityMode,
  ProvisionedMode,
  WarmThroughput,
  SecondaryIndexes,
  ResourcePolicy,
  GlobalTables,
  Backups,
  ExportToS3,
  StreamsTriggers,
  DAXFlow,
  ExamCheatSheet,
  DatabaseOverview,
  ServerlessFlow3D,
  ServerlessSpectrum,
  ServerlessTradeoffs,
  LambdaVsEC2,
  FunctionAnatomy,
  AuthoringOptions,
  ExecutionRole,
  EC2Automation,
  LambdaTriggers,
  ExecutionEnvironment3D,
  VersionsAliases,
  Concurrency,
  ReservedConcurrency,
  ProvisionedConcurrency,
  LambdaLayers,
  LambdaVPC,
  LeoStory,
  OSArchitecture,
  VMvsContainer3D,
  VMLimitations,
  DockerLifecycle,
  Orchestration,
  OrchestratorCompare,
  MonolithVsMicroservices,
  ECSBasics,
  ECSCluster,
  EC2vsFargate,
  ClusterInfraSetup,
  ECSAnywhere,
  ECSStorage,
  TaskVsService,
  WhyEKS,
  K8sArchitecture,
  K8sClusterServices,
  EKSClusterModes,
  NodeGroups,
  EKSRoles,
  ManageCluster,
  AppIntegration,
  MonoMicroScaling,
  SyncVsAsync,
  APIGatewayConcept,
  APITypes,
  RestVsHttp,
  WebSocketDemo,
  CRUDFlow,
  EndpointTypes,
  SecurityPolicyTLS,
  ResourcesMethods,
  IntegrationTypes,
  MethodRequestSettings,
  SecurityLayers,
  APIKeysUsagePlan,
  CanaryDeployment,
  CustomDomain,
  SQSConcept,
  SQSComponents,
  StandardVsFIFO,
  QueueConfig,
  VisibilityTimeout,
  PollingModes,
  DLQRedrive,
  FIFODedup,
  FIFOThroughput,
  SQSIntegrations,
  PubSubModel,
  SNSComponents,
  StandardVsFIFOTopic,
  TopicConfig,
  FanOut,
  FilterPolicy,
  DataProtectionPolicy,
  EventBridgeConcept,
  EventBridgeWorkflow,
  EventRule,
  EventBridgeScheduler,
  EventBridgeCheatSheet,
  BatchVsRealtime,
  KinesisFamily,
  KinesisTerminology,
  StreamVsFirehose,
  DataSyncFlow,
  GatewayConcept,
  GatewayTypes,
  DataSyncVsGateway,
  ConfigVisual,
  CloudTrailVisual,
  CloudWatchVisual,
  MonitoringComparison,
  InspectorVisual,
  TrustedAdvisorVisual,
  InspectorVsTrustedAdvisor,
  ACMVisual,
  EncryptionKeys,
  KMSVisual,
  STSVisual,
  WAFVisual,
  CloudHSMVisual,
  SnowFamily,
  ServerMigration,
  BillingTools,
  DataTransferCost,
  ObjectVsBlock,
  S3Features,
  StorageClasses,
  ExpressOneZone,
  Versioning,
  LifecycleRules,
  AccessControl,
  IAMvsBucketPolicy,
  ObjectLock,
  S3Encryption,
  SymmetricAsymmetric,
  ServerVsClientEnc,
  SSEOptions,
  KMSAccessDemo,
  SSECFlow,
  PublicAccessWays,
  BlockPublicAccess,
  BucketPolicyAnatomy,
  StaticHosting,
  CORSDemo,
  CRRDemo,
  TransferAcceleration,
  LoggingVsCloudTrail,
  RequesterPays,
  PresignedURL,
  MFADelete,
  EventNotification,
  MultipartUpload,
  VPCEndpoint,
  AccessPoints,
  ProjectArchitecture,
  ProjectRoadmap,
  HybridCluster,
  BuildImageFlow,
  EnvVarsBestPractice,
  IAMRoleVsKeys,
  ECRBridge,
  ECRvsDockerHub,
  TagMutability,
  PushToECR,
  TaskDefinitionBlueprint,
  OSArchMatch,
  NetworkModes,
  TaskSizeExplorer,
  TaskRoleVsExecution,
  PlacementConstraints,
  ContainerConfig,
  ResourceLimits,
  ECSStorageExplorer,
  TaskDefPrereqs,
  CapacityProviderCalc,
  ECSTaskVsServiceCtl,
  DeploymentConfigOptions,
  RollingVsBlueGreen,
  FailureDetection,
  ServiceNetworkingALB,
  ClusterVsServiceScaling,
  TargetTracking,
  StepScaling,
};

function renderMarkdown(text) {
  // Very lightweight markdown renderer — handles headings, bold, italic, lists, code, blockquotes
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{inlineFormat(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{inlineFormat(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i}>{inlineFormat(line.slice(2))}</h1>);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(<blockquote key={i}>{inlineFormat(line.slice(2))}</blockquote>);
    }
    // Horizontal rule
    else if (line.match(/^[-*]{3,}$/)) {
      elements.push(<hr key={i} />);
    }
    // Table
    else if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      const splitRow = (r) => {
        const cells = r.split("|");
        if (cells.length && cells[0].trim() === "") cells.shift();
        if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
        return cells;
      };
      const header = splitRow(rows[0]);
      const body = rows.slice(2); // skip separator row
      elements.push(
        <div key={`tblwrap-${i}`} className="table-wrap">
          <table>
            <thead>
              <tr>{header.map((h, hi) => <th key={hi}>{inlineFormat(h.trim())}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, ri) => {
                const cells = splitRow(row);
                return <tr key={ri}>{cells.map((c, ci) => <td key={ci}>{inlineFormat(c.trim())}</td>)}</tr>;
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // Unordered list
    else if (line.match(/^[-*+] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(<li key={i}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    }
    // Ordered list
    else if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\. /, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }
    // Code block
    else if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<pre key={`pre-${i}`}><code>{codeLines.join("\n")}</code></pre>);
    }
    // Empty line -> spacer
    else if (line.trim() === "") {
      elements.push(<div key={i} className="md-spacer" />);
    }
    // Normal paragraph
    else {
      elements.push(<p key={i}>{inlineFormat(line)}</p>);
    }
    i++;
  }
  return elements;
}

function decodeEntities(str) {
  if (str.indexOf("&") === -1) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function inlineFormat(rawText) {
  const text = decodeEntities(rawText);
  // Bold, italic, inline code — using a simple split approach
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const chunk = m[0];
    if (chunk.startsWith("`"))
      parts.push(<code key={key++} className="inline-code">{chunk.slice(1, -1)}</code>);
    else if (chunk.startsWith("**") || chunk.startsWith("__"))
      parts.push(<strong key={key++}>{chunk.slice(2, -2)}</strong>);
    else
      parts.push(<em key={key++}>{chunk.slice(1, -1)}</em>);
    last = m.index + chunk.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Cursor-following 3D tilt for cards
function handleTilt(e) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${px * 12}deg`);
  el.style.setProperty("--rx", `${-py * 12}deg`);
}
function resetTilt(e) {
  const el = e.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
}

// Small animated count-up for the hero stat numbers
function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf;
    const dur = 900;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

// Dashboard shown when nothing is selected
function Dashboard({ onSelect, progress }) {
  const total = awsCategories.reduce((a, c) => a + c.topics.length, 0);
  const done = Object.values(progress).filter(Boolean).length;

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <CloudNetworkHero />
        <div className="hero-inner">
          <div className="hero-badge hero-rise" style={{ "--d": "20ms" }}>
            <Cloud size={36} strokeWidth={2.2} />
          </div>
          <h1 className="hero-rise" style={{ "--d": "80ms" }}>AWS Learning Hub</h1>
          <p className="hero-rise" style={{ "--d": "160ms" }}>Master every AWS service — from compute to AI. Pick a category to start.</p>
          <div className="hero-stats hero-rise" style={{ "--d": "240ms" }}>
            <div className="stat">
              <span className="stat-num"><CountUp value={awsCategories.length} /></span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-num"><CountUp value={total} /></span>
              <span className="stat-label">Topics</span>
            </div>
            <div className="stat">
              <span className="stat-num"><CountUp value={done} /></span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          {total > 0 && (
            <div className="progress-bar-wrap hero-rise" style={{ "--d": "320ms" }}>
              <div className="progress-bar" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          )}
          <div className="hero-rise" style={{ "--d": "400ms" }}>
            <PoweredByAws />
          </div>
        </div>
      </div>

      <ArchitectureBand />

      <div className="cat-grid">
        {awsCategories.map((cat, i) => {
          const catDone = cat.topics.filter((t) => progress[t.id]).length;
          return (
            <button
              key={cat.id + "-" + i}
              className="cat-card tilt"
              onClick={() => onSelect(cat.topics[0].id)}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
              style={{ "--cat-color": cat.color }}
            >
              <div className="cat-card-glow" />
              <div className="cat-card-icon" style={{ color: cat.color }}>
                <CategoryIcon id={cat.id} size={22} />
              </div>
              <div className="cat-card-info">
                <div className="cat-card-label">{cat.label}</div>
                <div className="cat-card-count">
                  {catDone}/{cat.topics.length} topics
                </div>
              </div>
              <ChevronRight size={16} className="cat-card-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ContentArea({ selectedId, onSelect }) {
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aws-learn-progress")) || {};
    } catch {
      return {};
    }
  });

  // Persist completion progress
  useEffect(() => {
    try {
      localStorage.setItem("aws-learn-progress", JSON.stringify(progress));
    } catch {
      /* ignore quota errors */
    }
  }, [progress]);

  // Scroll back to top whenever the topic changes
  useEffect(() => {
    const main = document.querySelector(".main-content");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  // Scroll-reveal: fade-and-rise sections/visuals into view on every page.
  // Progressive enhancement — class is added by JS, so no-JS/reduced-motion stays visible.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".main-content") || document;
    const id = requestAnimationFrame(() => {
      const els = root.querySelectorAll(
        ".sv-card, .topic-content h2, .topic-content table, .topic-content blockquote, .arch-band"
      );
      if (!els.length) return;
      // pick a reveal flavour per element type for a livelier, varied entrance
      const variantFor = (el) => {
        if (el.classList.contains("sv-card")) return "reveal-3d";
        if (el.classList.contains("arch-band")) return "reveal-scale";
        if (el.tagName === "H2") return "reveal-left";
        if (el.tagName === "TABLE") return "reveal-scale";
        if (el.tagName === "BLOCKQUOTE") return "reveal-right";
        return "reveal-up";
      };
      els.forEach((el) => el.classList.add("reveal", variantFor(el)));
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("reveal-in");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach((el) => io.observe(el));
      root._revealObserver = io;
    });
    return () => {
      cancelAnimationFrame(id);
      if (root._revealObserver) root._revealObserver.disconnect();
    };
  }, [selectedId]);

  const toggleDone = (id) =>
    setProgress((p) => ({ ...p, [id]: !p[id] }));

  if (!selectedId) {
    return <Dashboard onSelect={onSelect} progress={progress} />;
  }

  const topic = topicMap[selectedId];
  if (!topic) return null;

  // Find prev / next in the same category
  const cat = awsCategories.find((c) => c.id === topic.categoryId);
  const idx = cat.topics.findIndex((t) => t.id === selectedId);
  const prev = cat.topics[idx - 1];
  const next = cat.topics[idx + 1];
  const isDone = !!progress[selectedId];

  return (
    <div className="content-area" key={selectedId}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="bc-home" onClick={() => onSelect(null)}>
          <BookOpen size={13} /> Home
        </button>
        <ChevronRight size={12} />
        <span style={{ color: topic.categoryColor }}>{topic.categoryLabel}</span>
        <ChevronRight size={12} />
        <span>{topic.title}</span>
      </div>

      {/* Topic header */}
      <div className="topic-header" style={{ "--cat-color": topic.categoryColor }}>
        <div className="topic-header-left">
          <div className="topic-tag" style={{ background: topic.categoryColor + "22", color: topic.categoryColor }}>
            {topic.categoryLabel}
          </div>
          <h1 className="topic-h1">{topic.title}</h1>
          <p className="topic-short">{topic.shortDesc}</p>
        </div>
        <button
          className={`done-btn ${isDone ? "done" : ""}`}
          onClick={() => toggleDone(selectedId)}
          title={isDone ? "Mark as not done" : "Mark as done"}
        >
          {isDone ? <CheckCircle size={18} /> : <Circle size={18} />}
          {isDone ? "Completed" : "Mark complete"}
        </button>
      </div>

      {/* Content */}
      <div className="topic-content">
        {renderMarkdown(topic.content)}
      </div>

      {/* Interactive Visuals */}
      {topic.visuals && topic.visuals.length > 0 && (
        <div className="topic-visuals">
          <div className="visuals-header">
            <span className="visuals-icon">🎮</span>
            <span>Interactive Visualisations</span>
          </div>
          {topic.visuals.map((name) => {
            const Comp = VISUAL_MAP[name];
            return Comp ? <Comp key={name} /> : null;
          })}
        </div>
      )}

      {/* Prev / Next */}
      <div className="topic-nav">
        {prev ? (
          <button className="nav-btn prev" onClick={() => onSelect(prev.id)}>
            ← {prev.title}
          </button>
        ) : <div />}
        {next ? (
          <button className="nav-btn next" onClick={() => onSelect(next.id)}>
            {next.title} →
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
