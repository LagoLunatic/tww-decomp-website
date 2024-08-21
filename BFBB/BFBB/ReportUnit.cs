namespace BFBB;

public record ReportUnitMeasures(
    float FuzzyMatchPercent,
    long TotalCode,
    long MatchedCode,
    long TotalData,
    long MatchedData,
    int TotalFunctions,
    int MatchedFunctions
);

public record ReportUnitMetadata(
    bool Complete,
    string ModuleName,
    int ModuleId
);

public record ReportUnit(
    string Name,
    bool? Complete,
    string? ModuleName,
    int? ModuleId,
    ReportUnitMeasures Measures,
    List<ReportItem> Sections,
    List<ReportItem>? Functions,
    ReportUnitMetadata? Metadata
);