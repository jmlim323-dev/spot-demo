import { flowStep } from "../styles";

interface FlowStepProps {
  label: string;
  active: boolean;
  done: boolean;
}

export default function FlowStep({ label, active, done }: FlowStepProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={flowStep.dot(done, active)}>
        {done ? "✓" : "·"}
      </div>
      <span style={flowStep.label(done, active)}>{label}</span>
    </div>
  );
}
