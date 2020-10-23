# 1. Setting up the project in the Google API Console

*In this part of the manual we'll create a project in the Google API Console, connect it to the Google Fit API and make OAuth2 credentials for it — so that the user can give it permission to their Google Fit data.* 


## Step 1: Creating a Google project for my application

First off, I went to the [Google API Console](https://console.developers.google.com/apis) and went to **IAM and management > Manage resources > Create project.** 

![image](https://user-images.githubusercontent.com/57796369/96643840-73f52f80-1328-11eb-995b-4b07068d8b5e.png)


## Step 2: Linking the project to the Google Fit API

To connect my project to the Google Fit API, I went to **Library > searched "Fit" > Fitness API > Enable**

![image](https://user-images.githubusercontent.com/57796369/96643777-5de76f00-1328-11eb-9907-877a224c0326.png)


## Step 3: Creating an OAuth Client ID

Lastly, I went to **Credentials > New credentials > OAuth Client ID.**

I selected "Webapplication" (since I was going to be fetching data from this API in Google Apps Script). I left everything else as default:

![image](https://user-images.githubusercontent.com/57796369/96643923-9129fe00-1328-11eb-8c5b-e6a129d073dc.png)


*That's it for this part of the manual! We created a Google Cloud project, connected it to the Google Fit API and gave it OAuth credentials. In the next part we'll [fetch the Google Fit data in a Google Apps Script. 👉🏻](https://github.com/karimeij/smartdesk/blob/main/manual/part-2.md)*


## Sources
* [https://support.google.com/googleapi/answer/6251787?hl=en](https://support.google.com/googleapi/answer/6251787?hl=en)
* [https://cloud.google.com/resource-manager/docs/creating-managing-projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
