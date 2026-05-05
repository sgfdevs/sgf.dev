#nullable enable
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Extensions;

namespace SgfDevs.Dev;

public class PresentationPresenterDisplayService
{
    private const string FallbackImage = "/images/pipey.jpg";

    private readonly MemberConverter _memberConverter;
    private readonly MemberTagDisplayService _memberTagDisplayService;

    public PresentationPresenterDisplayService(
        MemberConverter memberConverter,
        MemberTagDisplayService memberTagDisplayService)
    {
        _memberConverter = memberConverter;
        _memberTagDisplayService = memberTagDisplayService;
    }

    public IReadOnlyList<PresentationPresenterDisplay> GetPresenters(Presentation presentation, int imageWidth)
    {
        var presenters = new List<PresentationPresenterDisplay>();

        if (presentation.Presenters == null)
        {
            return presenters;
        }

        foreach (var block in presentation.Presenters)
        {
            switch (block.Content)
            {
                case PresenterPicker presenterPicker when presenterPicker.Member != null:
                {
                    var member = _memberConverter.FromContent(presenterPicker.Member);
                    var memberUsername = member.Username?.ToLowerInvariant() ?? string.Empty;
                    presenters.Add(new PresentationPresenterDisplay(
                        member.Name,
                        member.ProfileImage?.GetCropUrl(width: imageWidth) ?? FallbackImage,
                        $"/member/{memberUsername}",
                        _memberTagDisplayService.GetDisplayMemberTags(member).ToList()));
                    break;
                }
                case NonMemberPresenter nonMemberPresenter:
                    presenters.Add(new PresentationPresenterDisplay(
                        nonMemberPresenter.PresenterName ?? "Presenter",
                        nonMemberPresenter.ProfileImage?.GetCropUrl(width: imageWidth) ?? FallbackImage,
                        null,
                        []));
                    break;
            }
        }

        return presenters;
    }
}

public record PresentationPresenterDisplay(
    string Name,
    string ImageUrl,
    string? ProfileUrl,
    IReadOnlyList<string> Tags);
