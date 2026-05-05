using System.Collections.Generic;
using System.Text.Json;
using SgfDevs.Dev.EventSync;
using Xunit;

namespace SgfDevs.Tests;

public class ImportedPresenterBlockBuilderTests
{
    private readonly ImportedPresenterBlockBuilder _builder = new();

    [Fact]
    public void Build_ReturnsEmptyStringWhenNoPresentersExist()
    {
        var result = _builder.Build([]);

        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void Build_CreatesBlockListPayloadForNonMemberPresenters()
    {
        var result = _builder.Build(
        [
            new ImportedPresenterPlan("Bertram Gilfoyle", null),
            new ImportedPresenterPlan("Dinesh Chugtai", null)
        ]);

        using var document = JsonDocument.Parse(result);
        var root = document.RootElement;

        Assert.Equal(2, root.GetProperty("contentData").GetArrayLength());
        Assert.Equal(2, root.GetProperty("expose").GetArrayLength());
        Assert.Equal(2, root.GetProperty("Layout").GetProperty("Umbraco.BlockList").GetArrayLength());

        var firstValues = root.GetProperty("contentData")[0].GetProperty("values");
        Assert.Equal("presenterName", firstValues[0].GetProperty("alias").GetString());
        Assert.Equal("Bertram Gilfoyle", firstValues[0].GetProperty("value").GetString());
        Assert.Equal("profileImage", firstValues[1].GetProperty("alias").GetString());
        Assert.Equal(string.Empty, firstValues[1].GetProperty("value").GetString());
    }
}
