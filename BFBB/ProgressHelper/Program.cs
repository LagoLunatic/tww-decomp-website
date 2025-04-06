using BFBB;

var inputPath = args[0];
var outPath = args[1];

var progress = File.ReadAllText($"{inputPath}progress.json");

var report = JsonHelper.Deserialize<Report>(progress);

var gameReport =
    new Report(Units: report.Units
        .Select(unit => unit with
        {
            Functions = (unit.Functions != null ? unit.Functions.ToList() : new List<ReportItem>())
        })
        .ToList());

List<string> sampleUnits = ["d_a_player_main"];

var tsSample = gameReport with
{
    Units = gameReport.Units.Where(
        x => sampleUnits.Any(u => x.Name.Contains(u))
    ).ToList()
};

var sampleJson = JsonHelper.Serialize(tsSample);

var outProgressJson = JsonHelper.Serialize(gameReport);
var outAPIJson = JsonHelper.Serialize(new
{
    gameReport.MatchedCode,
    gameReport.MatchedData,
    gameReport.MatchedFunctions,
    gameReport.TotalCode,
    gameReport.TotalData,
    gameReport.TotalFunctions,
    gameReport.MatchedCodePercent,
    gameReport.MatchedDataPercent,
    gameReport.MatchedFunctionsPercent,
    gameReport.FuzzyMatchPercent,
    PerfectMatch = gameReport.MatchedCodePercent.ToString("0.00") + "%",
    FuzzyMatch = gameReport.FuzzyMatchPercent.ToString("0.00") + "%",
    FunctionsMatched = gameReport.MatchedFunctionsPercent.ToString("0.00") + "%"
});


File.WriteAllText($"{outPath}/progress.json", outProgressJson);
File.WriteAllText($"{outPath}/sample.json", sampleJson);
File.WriteAllText($"{outPath}../public/api.json", outAPIJson);
