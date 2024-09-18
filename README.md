# Springfield Devs Website

![](https://pbs.twimg.com/profile_banners/2869149607/1567717351/1500x500)

**Important Note:** If you're contributing to the rewrite, please see `sgfdevs-frontend/README.md`

## Prerequisites
- [.NET SDK 8.x](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js 18.x](https://nodejs.org/en/download/)

## Local Installation Instructions

There are a couple of ways to run this project depending on if you have a .NET IDE installed or just the CLI tools

### Environment Specific Steps

- Create an `Umbraco.sqlite.db` file in the `./SgfDevs/umbraco/Data` directory 
  - Mac OS/Linux `mkdir -p ./SgfDevs/umbraco/Data && touch ./SgfDevs/umbraco/Data/Umbraco.sqlite.db`
  - Windows `New-Item -ItemType Directory -Force -Path .\SgfDevs\umbraco\Data; New-Item -ItemType File -Force -Path .\SgfDevs\umbraco\Data\Umbraco.sqlite.db`

#### CLI Tools
- Copy `.env.example` to `.env`
- Navigate to the SgfDevs project folder `cd SgfDevs`
- User the `dotnet user-secrets` command to set your connection string
  - `dotnet user-secrets set "ConnectionStrings:umbracoDbDSN" "Data Source=|DataDirectory|/Umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True"`
- `dotnet run`
- Open the URL that's printed in the console in your browser

#### .NET IDE e.g. Rider or Visual Studio (Windows)
- Copy `.env.example` to `.env`
- Update your .NET User Secrets with a connection string
  - Most IDEs have a shortcut to navigate to this file
  - Reference `appsettings.json` for an example of the `ConnectionStrings` object
    - Set `umbracoDbDSN` to something like `Data Source=|DataDirectory|/Umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True`
  - You can also fall back to the CLI tools instructions
- Your IDE will likely have some kind of run option, run this and it should launch your browser

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
