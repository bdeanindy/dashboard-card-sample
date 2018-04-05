# Weebly Dashboard Card Sample App

Help Weebly Developers understand the basics of building Dashboard Card Apps and using Webhooks to update card content using the Card API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for initial development and testing purposes.
See deployment for notes on how to deploy the Weebly and web portions of this app.

### Prerequisites

It is expected that you already have a Weebly Developer Account and can login to the [Weebly Developer Admin](https://www.weebly.com/developer-admin/), if you do not you can [Create a Free Weebly Developer Account](https://dev.weebly.com/create-a-developer-account.html).

You will need to define a new Weebly App named `Hello World` to [Register a Weebly App](https://dev.weebly.com/register-your-app.html).

To operate this library locally, you will need the following installed:

* [Node.js](https://maven.apache.org/) - JavaScript runtime built on Chrome's V8 JavaScript Engine
* [NPM.js](https://npmjs.org) - Leading package manager for JavaScript
* [MongoDB](https://www.mongodb.com/) - NoSQL Database
* [ngrok](https://ngrok.com/) - Secure public URLs for local apps

### Get the Code

There are two ways you can get the code onto your local workstation.

#### Clone with Git

Clone using Git

```
git clone https://github.com/bdeanindy/dasbhoard-card-sample.git
```

#### Download the `.zip`

1. Download the `.zip` file here: [https://github.com/bdeanindy/dasbhoard-card-sample/archive/master.zip](https://github.com/bdeanindy/dasbhoard-card-sample/archive/master.zip).
2. Extract the `dasbhoard-card-sample.zip` file contents:
    * [How to extract Zip files on Windows](https://support.microsoft.com/en-us/help/14200/windows-compress-uncompress-zip-files)
    * [How to extract Zip files on Mac](https://support.apple.com/kb/PH25411?locale=en_US)
    * [How to extract Zip files on Ubuntu](https://askubuntu.com/questions/86849/how-to-unzip-a-zip-file-from-the-terminal)
    * From Linux command line: `tar -xvf dasbhoard-card-sample.zip -C /destination/directory/`

### Get your Weebly App API Keys

Make sure to [Create a Weebly Developer Account](https://dev.weebly.com/create-a-developer-account.html), if you have not already.

You will need your **Weebly API Keys** and a **Weebly Developer Site** in order for this code to work properly after it is deployed.

Next, please [Register a Weebly App](https://dev.weebly.com/register-your-app.html) to obtain your API Keys.

While registering your new Weebly App, give it the name "Dashboard Card", and set the type to `services`.

### Configurations

Now that you have the code on your workstation, and your new Weebly App API Keys on-hand, you will need to update the code prior to deployment to Weebly.

1. Open [manifest.json.tmpl](/manifest.json.tmpl) and replace/update all values wrapped in double-braces, such as: `{{WEEBLY_CLIENT_ID}}` with the appropriate values from the app you created as a prerequisite.
2. Rename the file to `manifest.json` and save the changes.
3. Rename the `env.tmpl` file to `.env`, open the file, and replace the values with your own as indicated
4. Next, open the [Weebly Developer Admin](https://www.weebly.com/developer-admin), login if you are not already, and click on the "Dashboard Card" app if it is not already open

## Running Locally

Install the dependencies: `npm install`

1. Get ngrok started, and replace the values where needed in the `.env` file (update your manifest as well if needed)
2. Start the app `npm start` (you'll need Mongo running if it is not already)
3. Install the app from the [Developer Portal Admin](https://www.weebly.com/developer-admin/) into your Developer Test Site
4. Once app installation is complete, click the header of the new dashboard card and watch data in the [NGROK inspector](http://localhost:4040)

## Deployment

1. Create a **.zip** file of EVERYTHING within the root directory (except the `.git` folder)
2. Name or Rename the newly created **ZIP** file: `0.1.0.zip` (I've found it helpful to keep my zip file names mapped to the same as my app version value in the `manifest.json` file)
3. **Upload a New Version** of your app's zip file in the Weebly Developer Admin and complete the form for the other required fields
4. Click the **Save Draft** link. __Correct any errors displayed,  and try clicking the **Save Draft** link again__
5. Go back to the **Dashboard Card** app's **Versions** tab, and click on the link labeled **Install to Site** and choose your Weebly Developer Site
6. The Dashboard Card should immediately open, and you should see its content

## Built With

* [Github](https://github.com)
* [Node.js](https://maven.apache.org/) - JavaScript runtime built on Chrome's V8 JavaScript Engine
* [NPM.js](https://npmjs.org) - Leading package manager for JavaScript
* [Express.js](https://expressjs.org) - Node.js Based Web Server
* [MongoDB](https://www.mongodb.com/) - NoSQL Database
* [Mongoose](http://mongoosejs.com/) - Node.js Object Modeling for MongoDB
* [ngrok](https://ngrok.com/) - Secure public URLs for local apps
* [NVM](https://github.com/creationix/nvm) - Leading Node Version Manager

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the Weebly Code of Conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial documentation work* - [PurpleBooth](https://github.com/PurpleBooth)
* **Benjamin Dean** - *Core Contributor* - [bdeanindy](https://github.com/bdeanindy)

## Contributors

* Submit a PR that is merged to see your name here!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Weebly Engineering Team for all their efforts
* Robin Whitmore - the initial author of the Weebly Developer Docs and reviewer making this app possible
* You, and all the Weebly App Developers who make Weebly awesome with your awesome questions and challenging issues
