using System.IO;
using System.Text;
using SgfDevs.Dev.EventSync;
using Xunit;

namespace SgfDevs.Tests;

public class SessionizeSpeakerMediaServiceTests
{
    [Fact]
    public void StreamsHaveEqualContent_ReturnsTrueForIdenticalContent()
    {
        using var first = CreateStream("same image");
        using var second = CreateStream("same image");

        var result = SessionizeSpeakerMediaService.StreamsHaveEqualContent(first, second);

        Assert.True(result);
    }

    [Fact]
    public void StreamsHaveEqualContent_ReturnsFalseForDifferentContent()
    {
        using var first = CreateStream("first image");
        using var second = CreateStream("second image");

        var result = SessionizeSpeakerMediaService.StreamsHaveEqualContent(first, second);

        Assert.False(result);
    }

    [Fact]
    public void StreamsHaveEqualContent_RestoresFirstStreamPosition()
    {
        using var first = CreateStream("same image");
        using var second = CreateStream("same image");
        first.Position = 2;
        second.Position = 4;

        var result = SessionizeSpeakerMediaService.StreamsHaveEqualContent(first, second);

        Assert.True(result);
        Assert.Equal(2, first.Position);
        Assert.Equal(4, second.Position);
    }

    private static MemoryStream CreateStream(string content) => new(Encoding.UTF8.GetBytes(content));
}
