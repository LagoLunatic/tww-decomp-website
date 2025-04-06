import { Progress, Tooltip } from "@mantine/core";
import { prettyPercent } from "./helpers";

type ProgressBarData = {
  percentage: number;
  label?: string;
  color?: string;
};

export type ProgressBarProps = {
  linked?: ProgressBarData;
  current: ProgressBarData;
  fuzzy?: ProgressBarData;
  size?: number;
};

export function ProgressBar(props: ProgressBarProps) {
  const { linked, current, fuzzy, size } = props;

  return (
    <div>
      <Progress.Root size={size ?? 25}>
        {linked !== undefined && (
          <Tooltip
            label={
              linked.label ?? prettyPercent(linked.percentage) + " Linked"
            }
          >
            <Progress.Section
              striped={false}
              value={linked.percentage}
              color={linked.color ?? "green"}
            />
          </Tooltip>
        )}
        <Tooltip
          label={
            current.label ??
            prettyPercent(current.percentage) + " Perfectly Matching"
          }
        >
          <Progress.Section
            striped={linked == null && current.percentage == 100 ? false : true}
            value={current.percentage - (linked ? linked.percentage : 0)}
            color={current.color ?? "green"}
          />
        </Tooltip>
        {fuzzy !== undefined && (
          <Tooltip
            label={
              fuzzy.label ?? prettyPercent(fuzzy.percentage) + " Fuzzy Match"
            }
          >
            <Progress.Section
              striped
              value={fuzzy.percentage - current.percentage}
              color={fuzzy.color ?? "rgb(50, 50, 50)"}
            />
          </Tooltip>
        )}
      </Progress.Root>
    </div>
  );
}
