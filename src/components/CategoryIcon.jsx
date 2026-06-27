import {
  Rocket, Cpu, HardDrive, Database, Network, Shield, Activity,
  MessageSquare, Wrench, Bot, Sparkles, BarChart3, Globe2, Trophy,
  DollarSign, FlaskConical, Boxes,
} from "lucide-react";

/*
 * CategoryIcon — maps a category id to a consistent Lucide line-icon
 * (AWS-service-icon style), replacing the emoji chrome. Falls back to a
 * generic "Boxes" icon for any unknown id.
 */
const MAP = {
  foundations:       Rocket,
  compute:           Cpu,
  storage:           HardDrive,
  database:          Database,
  networking:        Network,
  security:          Shield,
  monitoring:        Activity,
  messaging:         MessageSquare,
  devtools:          Wrench,
  "ai-ml":           Bot,
  "genai-on-aws":    Sparkles,
  analytics:         BarChart3,
  "global-infra":    Globe2,
  projects:          Trophy,
  "migration-billing": DollarSign,
  labs:              FlaskConical,
};

export default function CategoryIcon({ id, size = 18, strokeWidth = 2 }) {
  const Icon = MAP[id] || Boxes;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
