using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Logging;
using SgfDevs.Dev;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Cms.Web.Common.Security;

namespace SGFDevs.Controllers;

public class MemberController : UmbracoPageController, IVirtualPageController
{
    private IMemberManager _memberManager;
    private readonly MemberConverter _memberConverter;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private ILogger<MemberController> _logger;

    public MemberController(
        ILogger<MemberController> logger,
        ICompositeViewEngine compositeViewEngine,
        IUmbracoContextAccessor umbracoContextAccessor,
        IMemberManager memberManager,
        MemberConverter memberConverter
    ) : base(logger, compositeViewEngine)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _memberManager = memberManager;
        _memberConverter = memberConverter;
        _logger = logger;
    }

    public IPublishedContent FindContent(ActionExecutingContext actionExecutingContext)
    {
        return _umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext) ? umbracoContext.Content.GetByRoute("/member") : null;
    }

    [HttpGet]
    public async Task<IActionResult> MemberProfile(string username)
    {
        var memberUser = await _memberManager.FindByNameAsync(username);
        if (memberUser == null)
        {
            return NotFound();
        }

        var member = _memberConverter.FromContent(_memberManager.AsPublishedMember(memberUser));

        return View(member);
    }
}
