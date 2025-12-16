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
    private readonly IDocumentUrlService _documentUrlService;
    private readonly MemberConverter _memberConverter;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private ILogger<MemberController> _logger;

    public MemberController(
        ILogger<MemberController> logger,
        ICompositeViewEngine compositeViewEngine,
        IUmbracoContextAccessor umbracoContextAccessor,
        IMemberManager memberManager,
        IDocumentUrlService documentUrlService,
        MemberConverter memberConverter
    ) : base(logger, compositeViewEngine)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _memberManager = memberManager;
        _documentUrlService = documentUrlService;
        _memberConverter = memberConverter;
        _logger = logger;
    }

    public IPublishedContent FindContent(ActionExecutingContext actionExecutingContext)
    {
        var key = _documentUrlService.GetDocumentKeyByRoute("/member", null, null, false);

        if (key is null)
        {
            return null;
        }

        if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            return null;
        }

        return umbracoContext.Content.GetById(key.Value);
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
