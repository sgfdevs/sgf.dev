using System;
using Microsoft.AspNetCore.Mvc;

namespace SGFDevs.Controllers;

[Route("error")]
public class ErrorController : Controller
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        throw new InvalidOperationException();
    }
}
