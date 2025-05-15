using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Member = Umbraco.Cms.Web.Common.PublishedModels.Member;

namespace SgfDevs.Dev;

public class MemberConverter
{
    private readonly IPublishedValueFallback _publishedValueFallback;
    private readonly IPublishedMemberCache _publishedMemberCache;

    public MemberConverter(IPublishedValueFallback publishedValueFallback, IPublishedMemberCache publishedMemberCache)
    {
        _publishedValueFallback = publishedValueFallback;
        _publishedMemberCache = publishedMemberCache;
    }

    public Member FromContent(IPublishedContent publishedContent)
    {
        return new Member(publishedContent, _publishedValueFallback);
    }

    public Member FromMember(IMember member)
    {
        var content = _publishedMemberCache.Get(member);
        return FromContent(content);
    }
}
