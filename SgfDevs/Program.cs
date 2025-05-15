using System;
using System.Data.Common;
using Microsoft.AspNetCore.Builder;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SGFDevs.Controllers;
using SgfDevs.Dev;
using SGFDevs.Dev;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Persistence.Sqlite;
using Umbraco.Extensions;

var builder = WebApplication.CreateBuilder(args);

var umbracoBuilder = builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers();

var blobStorageKey = builder.Configuration["SGFDevs:AzureBlobStorageKey"];
if (string.IsNullOrEmpty(blobStorageKey))
{
    umbracoBuilder.AddCdnMediaUrlProvider(options =>
    {
        options.Url = new Uri("https://sgf.dev/media/");
    });
}
else
{
    umbracoBuilder.AddAzureBlobMediaFileSystem(options =>
    {
        options.ConnectionString = $"DefaultEndpointsProtocol=https;AccountName=sgfdevs;AccountKey={blobStorageKey};EndpointSuffix=core.windows.net";
        options.ContainerName = "website";
    });
}

umbracoBuilder.Build();

builder.Services.AddHttpClient();
builder.Services.AddScoped<MemberConverter>();
builder.Services.AddScoped<DirectoryHelper>();
builder.Services.AddScoped<NewsletterHelper>();

var app = builder.Build();

if (builder.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

await app.BootUmbracoAsync();


app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.EndpointRouteBuilder.MapControllerRoute(
            "ProfileCustomRoute",
            "member/{username}",
            new { Controller = "Member", Action = "MemberProfile" });
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
