# Springfield Devs Website

![](https://pbs.twimg.com/profile_banners/2869149607/1567717351/1500x500)

**Important Note:** If you're contributing to the rewrite, please see `sgfdevs-frontend/README.md`

## Prerequisites
- [.NET SDK 8.x](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Note for Apple Silicon Mac OS users, make sure to enable "Use Rosetta for x86/amd64 emulation" option in the Docker Desktop settings
- [Node.js 18.x](https://nodejs.org/en/download/)

## Local Installation Instructions

There are a couple of ways to run this project depending on if you have a .NET IDE installed or just the CLI tools

### Environment Specific Steps

#### CLI Tools
- Copy `.env.example` to `.env`
- Run `docker compose up -d mssql-init`
  - Note: if you're on an Apple Silicon Mac Os there will be a lot of warnings, this is expected and should not cause issues
- Navigate to the SgfDevs project folder `cd SgfDevs`
- User the `dotnet user-secrets` command to set your connection string
  - `dotnet user-secrets set "ConnectionStrings:umbracoDbDSN" "Server=localhost,1433; Database=SgfDevs; User Id=sa; Password=MyP@ssword;TrustServerCertificate=True;"`
  - Make sure the port and password in the above command match the values in `.env`
- `dotnet run`
- Open the URL that's printed in the console in your browser

#### .NET IDE e.g. Rider or Visual Studio (Windows)
- Copy `.env.example` to `.env`
- Update your .NET User Secrets with a connection string
  - Most IDEs have a shortcut to navigate to this file
  - Reference `appsettings.json` for an example of the `ConnectionStrings` object
    - Note that the actual connection string should reference the docker compose name instead of `localhost`
    - e.g. `Server=mssql,1433; Database=SgfDevs; User Id=sa; Password=MyP@ssword; TrustServerCertificate=True;`
  - You can also fall back to the CLI tools instructions
- You should see a "Configuration" option in your IDE for docker compose, run this
- Open a browser to `https://localhost:5001`
  - Substitute 5001 with whatever port you specified for `APP_HTTPS_PORT` in `.env`

### Umbraco In-browser Steps
- Once the site has been launched you should see an Umbraco screen to create a new account
- Fill this out and wait a few seconds for Umbraco to install
- Once you're redirected to the Admin, click on the Settings tab
- Navigation to "uSync" under "Synchronization" in the left panel
- Under the "Everything" card click the green "Import" button
- Once this is finished navigate to the site's root url and you should see a functioning site

## Building CSS
- Navigate to the SgfDevs project folder `cd SgfDevs`
- `npm install`
- `npm run build` or to watch for changes `npm run css`
