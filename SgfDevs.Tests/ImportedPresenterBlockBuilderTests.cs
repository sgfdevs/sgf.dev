using System.Collections.Generic;
using System.Text.Json;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class ImportedPresenterBlockBuilderTests
{
    private readonly ImportedPresenterBlockBuilder _builder = new(
        new Guid("1bdea08d-8393-4e70-85a9-2ca27bef54f1"),
        new Guid("5ff3a2c3-9dc3-4131-8f07-99c2c0a38be5"));

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
            new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null, MatchedMemberKey: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")),
            new ImportedPresenterPlan("speaker-2", "Dinesh Chugtai", null)
        ]);

        using var document = JsonDocument.Parse(result);
        var root = document.RootElement;

        Assert.Equal(2, root.GetProperty("contentData").GetArrayLength());
        Assert.Equal(2, root.GetProperty("expose").GetArrayLength());
        Assert.Equal(2, root.GetProperty("Layout").GetProperty("Umbraco.BlockList").GetArrayLength());

        var firstValues = root.GetProperty("contentData")[0].GetProperty("values");
        Assert.Equal("member", firstValues[0].GetProperty("alias").GetString());
        Assert.Equal("umb://member/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", firstValues[0].GetProperty("value").GetString());

        var secondValues = root.GetProperty("contentData")[1].GetProperty("values");
        Assert.Equal("presenterName", secondValues[0].GetProperty("alias").GetString());
        Assert.Equal("Dinesh Chugtai", secondValues[0].GetProperty("value").GetString());
        Assert.Equal(string.Empty, secondValues[1].GetProperty("value").GetString());
    }
}
