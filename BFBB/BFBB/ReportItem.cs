using System.Text.Json.Serialization;

namespace BFBB;

public record ReportItemMetadata(
    string? DemangledName,
    string VirtualAddress
);

public record ReportItem(
    // Objdiff report properties
    string Name,
    long Size,
    float FuzzyMatchPercent,
    ReportItemMetadata? Metadata
);