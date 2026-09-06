import { Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import "./FinOpsLauncher.css";

export default function FinOpsLauncher() {
  return (
    <Link
      to="/finops"
      className="finops-launcher-fab"
      aria-label="Open FinOps cost dashboard"
      title="FinOps — see and cut your AWS spend"
    >
      <PiggyBank size={21} />
    </Link>
  );
}
