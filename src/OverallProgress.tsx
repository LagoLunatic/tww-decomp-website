import {
  Group,
  Select,
  Stack,
  Container,
  Text,
  TextInput,
  ProgressSection,
  Tabs,
} from "@mantine/core";
import { ProgressReport, Unit } from "./progress";
import { prettyPercent } from "./helpers";
import { ProgressBar, ProgressBarProps } from "./ProgressBar";
import { FileHeatmap } from "./FileHeatmap";

import "./css/app.css";
import { SourceFileInfo } from "./File";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FileMetric, metricData } from "./FileMetric";

import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';

export function OverallProgress() {
  const total_percent = ProgressReport.matched_code_percent;
  const fuzzy_percent = ProgressReport.fuzzy_match_percent;
  const [linked_code_percent, set_linked_code_percent] = useState(0.0);
  const [linked_data_percent, set_linked_data_percent] = useState(0.0);
  const defaultUnit = ProgressReport.units.find(unit => unit.name == "framework/d/actor/d_a_player_main") || ProgressReport.units[0];
  const [unit, setUnit] = useState<Unit | undefined>(defaultUnit);
  const [sortMetric, setSortMetric] = useState<FileMetric | null>(null);
  const [highlightMetric, setHighlightMetric] = useState<FileMetric | null>(
    FileMetric.FuzzyPercent
  );
  const [fileFilter, setFileFilter] = useState("");
  const [functionFilter, setFunctionFilter] = useState("");
  const [plotData, setPlotData] = useState<uPlot.AlignedData>([[Date.now() / 1000], [0.0], [0.0]]);
  const [plotWidth, setPlotWidth] = useState(900);
  const plotContainerRef = useRef<HTMLDivElement>(null);

  const progressInfo: ({ name: string } & ProgressBarProps)[] = [
    {
      name: "Code",
      size: 40,
      linked: {
        percentage: linked_code_percent,
      },
      current: {
        percentage: ProgressReport.matched_code_percent,
      },
      fuzzy: {
        percentage: fuzzy_percent,
      },
    },
    {
      name: "Data",
      size: 40,
      linked: {
        color: "darkblue",
        percentage: linked_data_percent,
      },
      current: {
        color: "blue",
        percentage: ProgressReport.matched_data_percent,
      },
    },
  ];

  const gcUnits = ProgressReport.units.filter((x) =>
    x.name.includes("/dolphin/") ||
    x.name.includes("/PowerPC_EABI_Support/") ||
    x.name.includes("/TRK_MINNOW_DOLPHIN/") ||
    x.name.includes("/amcstubs/") ||
    x.name.includes("/OdemuExi2/") ||
    x.name.includes("/odenotstub/")
  );
  const engineUnits = ProgressReport.units.filter((x) =>
    x.name.includes("/m_Do/") ||
    x.name.includes("/f_ap/") ||
    x.name.includes("/f_op/") ||
    x.name.includes("/f_pc/") ||
    x.name.includes("/SSystem/") ||
    x.name.includes("/JSystem/") ||
    x.name == "framework/DynamicLink" ||
    x.name == "framework/c/c_dylink"
  );
  const gameUnits = ProgressReport.units.filter((x) =>
    x.name.includes("/d/") ||
    x.name.includes("/JAZelAudio/") ||
    x.name == "framework/c/c_damagereaction"
  );
  const otherUnits = ProgressReport.units.filter((x) =>
    !gcUnits.includes(x) &&
    !engineUnits.includes(x) &&
    !gameUnits.includes(x)
  );

  const allFolders = [
    {
      name: "TWW Game Code",
      units: gameUnits,
    },
    {
      name: "Core Game Engine",
      units: engineUnits,
    },
    {
      name: "GameCube Specific Code",
      units: gcUnits,
    },
  ];
  if (otherUnits.length > 0) {
    allFolders.push(
      {
        name: "Unsorted Code",
        units: otherUnits,
      },
    );
  }

  const onFileClick = (name: string) => {
    const unit = ProgressReport.units.find((x) => x.name === name);
    setUnit(unit);
  };

  function getUnits(units: Unit[]): Unit[] {
    // Filter units by filename
    const fileFiltered = !fileFilter
      ? units
      : units.filter((u) =>
          u.name.toLowerCase().includes(fileFilter.toLowerCase())
        );

    // filter by function name
    const filtered = !functionFilter
      ? fileFiltered
      : fileFiltered.filter((u) =>
          u.functions
            .flatMap((fn) => fn)
            .some(
              (fn) =>
                fn.name.toLowerCase().includes(functionFilter.toLowerCase()) ||
                fn.demangled_name
                  ?.toLowerCase()
                  .includes(functionFilter.toLowerCase())
            )
        );

    // filter by the current selected metric sort if it is selected
    if (!sortMetric) return filtered;
    const { value } = metricData[sortMetric];
    return filtered.sort((a, b) => value(b) - value(a));
  }
  
  type ProgressHistoryEntry = {
    timestamp: number,
    measures: {
      code: number,
      "code/total": number,
      data: number,
      "data/total": number,
    },
  };

  type ProgressHistory = {
    tww: {
      GZLE01: {
        all: ProgressHistoryEntry[],
        dol: ProgressHistoryEntry[],
        modules: ProgressHistoryEntry[],
      },
    },
  };

  function parseHistoryJson(result: ProgressHistory): uPlot.AlignedData {
    var timestamps: number[] = [];
    var code_percentages: number[] = [];
    var data_percentages: number[] = [];
    result.tww.GZLE01.all.reverse().map((entry) => {
      timestamps.push(entry.timestamp);
      code_percentages.push(100 * (entry.measures.code / entry.measures["code/total"]));
      data_percentages.push(100 * (entry.measures.data / entry.measures["data/total"]));
    });
    return [timestamps, code_percentages, data_percentages];
  }

  const progressHistoryUrl = "https://progress.decomp.club/data/tww/GZLE01/?mode=all";

  useEffect(() => {
    fetch(progressHistoryUrl)
      .then(res => res.json())
      .then((res: ProgressHistory) => {
        const linkedSpan = document.getElementById("linked-percent");
        if (linkedSpan != null) {
          const latestEntry = res.tww.GZLE01.all[0];
          const linkedCodePercent = 100 * (latestEntry.measures.code / latestEntry.measures["code/total"]);
          const linkedDataPercent = 100 * (latestEntry.measures.data / latestEntry.measures["data/total"]);
          set_linked_code_percent(linkedCodePercent);
          set_linked_data_percent(linkedDataPercent);
          linkedSpan.textContent = `(${prettyPercent(linkedCodePercent)} linked)`
        }
        return parseHistoryJson(res);
      })
      .then(data => setPlotData(data));
  }, [progressHistoryUrl]);

  useLayoutEffect(() => {
    if (plotContainerRef.current) {
      setPlotWidth(plotContainerRef.current.getBoundingClientRect().width);
    }
  }, [plotContainerRef]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
          setPlotWidth(entry.contentRect.width);
      });
    });
    if (plotContainerRef.current) {
      observer.observe(plotContainerRef.current);
    }
    return () => observer.disconnect();
  }, [plotContainerRef]);
  
  return (
    <Container id="main" size={"lg"}>
      <Stack gap={"md"}>
        <div>
          <h1>
            The Wind Waker is {prettyPercent(total_percent)}{" "}
            decompiled <span id="linked-percent"></span>
          </h1>
          <div>
            {progressInfo.map((info, id) => (
              <div key={id} style={{ marginBottom: "0.5rem" }}>
                <Text size={"lg"}>{info.name}</Text>
                <Group grow gap={"xl"}>
                  <div key={id} style={{ textAlign: "center" }}>
                    <ProgressBar {...info} />
                  </div>
                </Group>
              </div>
            ))}
          </div>
        </div>
        <div ref={plotContainerRef}>
          <UplotReact
            data={plotData}
            options={{
              width: plotWidth,
              height: 370,
              series: [
                {
                  label: "Date",
                  value: (_, val) => val == null ? "--" : new Date(val * 1000).toLocaleDateString()
                },
                {
                  label: "Linked Code",
                  scale: "%",
                  width: 3,
                  stroke: "rgb(47, 158, 68)",
                  value: (_, val) => val == null ? "--" : prettyPercent(val)
                },
                {
                  label: "Linked Data",
                  scale: "%",
                  width: 3,
                  stroke: "rgb(25, 113, 194)",
                  value: (_, val) => val == null ? "--" : prettyPercent(val)
                },
              ],
              axes: [
                {
                  stroke: "rgb(201, 201, 201)",
                  grid: {show: false},
                },
                {
                  stroke: "rgb(201, 201, 201)",
                  scale: "%",
                  incrs: [25,],
                  values: (_, ticks) => ticks.map(val => val.toFixed(0) + "%"),
                  grid: {
                    stroke: "rgb(66, 66, 66)",
                    width: 3,
                  },
                },
              ],
              scales: {
                "%": {
                  auto: true,
                  range: [0, 100],
                },
              },
            }}
          />
        </div>
        <Group grow gap={"lg"} align={"flex-start"}>
          <Stack gap={"sm"}>
            <Group grow>
              <TextInput
                value={fileFilter}
                onChange={(event) => setFileFilter(event.currentTarget.value)}
                label="File Name Filter"
                placeholder="Filter by file name"
              />
              <TextInput
                value={functionFilter}
                onChange={(event) =>
                  setFunctionFilter(event.currentTarget.value)
                }
                label="Function Name Filter"
                placeholder="Filter by function name"
              />
            </Group>
            <Group grow>
              <Select
                label="File Sort Metric"
                data={Object.entries(metricData).map(([key, data]) => ({
                  label: data.description,
                  value: key,
                }))}
                value={sortMetric}
                onChange={(value) => setSortMetric(value as FileMetric)}
              />
              <Select
                label="Highlight Metric"
                data={Object.entries(metricData).map(([key, data]) => ({
                  label: data.description,
                  value: key,
                }))}
                value={highlightMetric}
                onChange={(value) => setHighlightMetric(value as FileMetric)}
              />
            </Group>
            <Tabs defaultValue="TWW Game Code">
              <Tabs.List>
              {allFolders.map((folder, index) => (
                <Tabs.Tab key={index} value={folder.name}>
                  {folder.name}
                </Tabs.Tab>
              ))}
              </Tabs.List>
              {allFolders.map((folder, index) => (
                <FileHeatmap
                  key={index}
                  folderName={folder.name}
                  filteredUnits={getUnits(folder.units)}
                  allUnits={allFolders.flatMap((x) => x.units)}
                  onClick={onFileClick}
                  metric={
                    metricData[highlightMetric ?? FileMetric.FuzzyPercent]
                  }
                />
              ))}
            </Tabs>
          </Stack>
          {unit && <SourceFileInfo unit={unit} />}
        </Group>
      </Stack>
    </Container>
  );
}
