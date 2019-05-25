# alexa-restaurant-finder
Development of a custom Alexa skill leveraging Yelp's APIs to help users quickly find restaurants of their craving. Built on Alexa Skills Kit SDK for Node.js. See more complete documentation at https://developer.amazon.com/documentation.

This Alexa skill asks users what type of food they want to eat and in what city they would like to find restaurants. Based on those user inputs, an API call is made to Yelp to find the top 3 most-reviewed restaurants related to the type of food they wanted. Alexa then processes those results of the GET call and lists the names of restaurants back to the user.

## Getting Started
In your Alexa Developer Console, create a new skill, and be sure to specify "Custom" model and "Alexa-Hosted (Beta)" for hosting. 

Once the skill is created, insert the contents of **schema.json** into the *JSON Editor* tab under *Interaction Model*. Be sure to *Build Model* before proceeding to next step.

Now in the *Code* tab (found at the top of the Console), insert the contents of **index.js**, **package.json**, and **util.js** into the respective files in the *Skill Code*. Be sure to click Save and **_Deploy_**.

You can test the skill by clicking the *Test* tab to use the Alexa Simulator. To start, click the mic and say *"run restaurant finder"* or type the same prompt into the dialog box.

## Testing Skill - Alexa Skills Store
This custom Alexa skill is available on the [Alexa Skills Store](https://www.amazon.com/dp/B07S9JGXC8/ref=sr_1_4?keywords=restaurant+finder&qid=1558812256&s=digital-skills&sr=1-4). To run the skill, download and use the following prompts:
1. Alexa, run restaurant finder.
2. Alexa, start restaurant finder.

### License
MIT License
