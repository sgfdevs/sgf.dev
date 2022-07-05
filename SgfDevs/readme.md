# Springfield Devs Website

![](https://pbs.twimg.com/profile_banners/2869149607/1567717351/1500x500)

## Prerequisites

1. Install the latest stable version of the [.NET SDK](https://dotnet.microsoft.com/en-us/download)

2. If you plan on working with any css, make sure you have at least the latest stable version of [Node.js](https://nodejs.org/en/download/) installed in order to compile the .scss files.

3. At this moment you will need to reach out to a member of the group to get a backup of the database for restoring locally. Eventually this will be able to be downloaded through the website. Please join our [Discord](https://sgf.dev/discord) and message the committee-website channel and ask for access. Somebody will DM you with the file you will need for install step 4.

## Local Installation Instructions

1. Confirm that the .NET CLI is working by running `dotnet —version` in your terminal. If successful you should see the version of .NET that you have installed. Ex: 6.0.300

2. Clone this repository

`git clone git@github.com:sgfdevs/sgf.dev.git`

3. Change into the project directory

`cd sgf.dev/SgfDevs`

And run `dotnet build` and ensure there are no errors.

4. Next, you will need to have obtained a backup file for restoring all of the content locally. This is done via the uSync plugin for Umbraco. Once you have this file, unzip it and place all of the contents in the ./SgfDevs/uSync/v9 directory.

5. Now you are ready to fire up the site for the first time, which will kick off a blank install of the Umbraco CMS. Run the following command

`dotnet run`

6. The output in the terminal should list the url and port to access the site. Ex: https://localhost:44307/. Note: You may be asked for your machine’s credentials when accessing the https version, this is because a local certificate is being established.

7. Open your browser to the https URL and you should be prompted with a screen asking for your name, email, and a password - this will be the login for your local instance, so be sure to remember it. It is recommended to use the default database option which will create a SQLite database file on your machine. However, if you’d like to use SQL Server locally or remote, you can do so by clicking the Change Database Configuration button.

8. After a few moments you will be brought to the admin area. If you have extracted all of the contents of the uSync backup into the proper directory from step 4, you will now be able to restore all of the site content. Go to Settings->uSync and under the Everything box, click the green Import button. You may see a handful of warnings about missing templates and some others(this will eventually be cleaned up), but everything should be okay. Refresh the admin page and then click on the Content link in the top left. You should now see a fully populated content tree.

9. Go to the front-end of the site now by visiting the root url (remove /umbraco… and everything else to the right of that url segment)

## More Documentation Coming Soon

These are just the details to get the site up and running. In the future there will be further details about working with Umbraco and some specifics as to how things are utilized for the Devs site. In the meantime, please don’t hesitate to reach out to the Discord channel mentioned in step 3 of the Prerequisites