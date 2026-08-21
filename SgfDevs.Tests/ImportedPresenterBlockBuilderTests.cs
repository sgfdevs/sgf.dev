using System.Collections.Generic;
using System.Text.Json;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Sessionize;
using Xunit;

namespace SgfDevs.Tests;

public class ImportedPresenterBlockBuilderTests
{
    private static readonly Guid PresentationKey = new("11111111-1111-1111-1111-111111111111");

    private readonly ImportedPresenterBlockBuilder _builder = new(
        new Guid("1bdea08d-8393-4e70-85a9-2ca27bef54f1"),
        new Guid("5ff3a2c3-9dc3-4131-8f07-99c2c0a38be5"));

    [Fact]
    public void Build_ReturnsEmptyStringWhenNoPresentersExist()
    {
        var result = _builder.Build(PresentationKey, []);

        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void Build_CreatesBlockListPayloadForNonMemberPresenters()
    {
        var result = _builder.Build(
            PresentationKey,
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

    [Fact]
    public void Build_ReturnsSamePayloadForSamePresenters()
    {
        var presenters = new[]
        {
            new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null, MatchedMemberKey: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")),
            new ImportedPresenterPlan("speaker-2", "Dinesh Chugtai", null)
        };

        var first = _builder.Build(PresentationKey, presenters);
        var second = _builder.Build(PresentationKey, presenters);

        Assert.Equal(first, second);
    }

    [Fact]
    public void Build_ReturnsDifferentBlockKeysForDifferentPresentations()
    {
        var presenters = new[]
        {
            new ImportedPresenterPlan("speaker-1", "Bertram Gilfoyle", null)
        };

        var first = GetFirstBlockKey(_builder.Build(PresentationKey, presenters));
        var second = GetFirstBlockKey(_builder.Build(new Guid("22222222-2222-2222-2222-222222222222"), presenters));

        Assert.NotEqual(first, second);
    }

    private static Guid GetFirstBlockKey(string payload)
    {
        using var document = JsonDocument.Parse(payload);
        return document.RootElement.GetProperty("contentData")[0].GetProperty("key").GetGuid();
    }
}
