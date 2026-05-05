using System;
using System.Data.Common;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SGFDevs.Controllers;
using SgfDevs.Dev;
using SgfDevs.Dev.EventSync;
using SGFDevs.Dev;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Persistence.Sqlite;
using Umbraco.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseSentry();

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
builder.Services.Configure<EventSyncOptions>(builder.Configuration.GetSection("SGFDevs"));
builder.Services.AddScoped<MemberConverter>();
builder.Services.AddScoped<MemberTagDisplayService>();
builder.Services.AddScoped<PresentationPresenterDisplayService>();
builder.Services.AddScoped<EventDisplayService>();
builder.Services.AddScoped<DirectoryHelper>();
builder.Services.AddScoped<NewsletterHelper>();
builder.Services.AddScoped<SessionizeSyncPlanner>();
builder.Services.AddScoped<MeetupEventMatcher>();
builder.Services.AddScoped<ImportedPresenterBlockBuilder>();
builder.Services.AddScoped<SessionizeApiClient>();
builder.Services.AddScoped<MeetupApiClient>();
builder.Services.AddScoped<SessionizeEventSyncService>();

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
            "member/{username:regex(^[a-zA-Z0-9]+$)}",
            new { Controller = "Member", Action = "MemberProfile" });
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
