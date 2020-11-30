# sgf.dev

## Setup
- Copy `SgfDevs/config/connectionStrings.config.example` to `SgfDevs/config/connectionsStrings.config`.
    - Don't enter your connection string just yet. Umbraco will ask for that as a part of the install process and write that value to this file. If Umbraco sees that value there already it will assume the database is already setup and throw an error.
- Open `SgfDevs/Web.config` look for `<add key="Umbraco.Core.ConfigurationStatus" value="8.9.1" />` and remove the `8.9.1`.
    - Umbraco will automatically add that value back as a part of the install process
- Run the project and open it in a browser. You should be presented with the Umbraco install screen.
- Enter in the details for your local admin user and click Customize
- Enter in the connection details for your local database
- Login to the Umbraco backoffice and go to Settings > uSync
- Click the Import Dropdown and select Full Import
- Refresh the page and go to the Content section you should now see some nodes in the content tree.
