using Microsoft.AspNetCore.Mvc;
using SGFDevs.Models;

namespace SGFDevs.Views.Components.ForgottenPassword;

public class ForgottenPasswordViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View(new ForgotPasswordModel());
    }
}
