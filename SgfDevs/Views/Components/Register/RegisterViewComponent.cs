using Microsoft.AspNetCore.Mvc;
using SGFDevs.Models;
using Umbraco.Cms.Web.Common.Models;

namespace SGFDevs.Views.Components.Register;

public class RegisterViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View(new RegisterModel());
    }
}