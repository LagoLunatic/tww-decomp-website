using System.Text.Json;

namespace BFBB;

public record Report(List<ReportUnit> Units)
{
    public long TotalCode => Units.Select(x => x.Measures.TotalCode).Sum();
    public long TotalData => Units.Select(x => x.Measures.TotalData).Sum();
    public long TotalFunctions => Units.Select(x => x.Measures.TotalFunctions).Sum();
    public long MatchedCode => Units.Select(x => x.Measures.MatchedCode).Sum();
    public long MatchedData => Units.Select(x => x.Measures.MatchedData).Sum();
    public long MatchedFunctions => Units.Select(x => x.Measures.MatchedFunctions).Sum();

    public float FuzzyMatchPercent => TotalCode switch
    {
        0 => 100,
        _ => Units.Select(x => x.Measures.FuzzyMatchPercent * x.Measures.TotalCode).Sum() / TotalCode
    };

    public float MatchedCodePercent => TotalCode switch
    {
        0 => 100,
        _ => (float)MatchedCode / TotalCode * 100
    };

    public float MatchedDataPercent => TotalCode switch
    {
        0 => 100,
        _ => (float)MatchedData / TotalData * 100
    };

    public float MatchedFunctionsPercent => TotalCode switch
    {
        0 => 100,
        _ => (float)MatchedFunctions / TotalFunctions * 100
    };

}