using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Models;

namespace SGFDevs.Views.Components.Login;

public class LoginViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View(new LoginModel());
    }
}