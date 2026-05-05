using System.Collections.Generic;
using System.Text.Json;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class ImportedPresenterBlockBuilderTests
{
    private readonly ImportedPresenterBlockBuilder _builder = new(new Guid("5ff3a2c3-9dc3-4131-8f07-99c2c0a38be5"));

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
            new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null, "umb://media/0123456789abcdef0123456789abcdef"),
            new ImportedPresenterPlan("speaker-2", "Dinesh Chugtai", null)
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
        Assert.Equal("umb://media/0123456789abcdef0123456789abcdef", firstValues[1].GetProperty("value").GetString());

        var secondValues = root.GetProperty("contentData")[1].GetProperty("values");
        Assert.Equal(string.Empty, secondValues[1].GetProperty("value").GetString());
    }
}
