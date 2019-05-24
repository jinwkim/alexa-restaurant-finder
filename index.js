const Alexa = require('ask-sdk-core');

// Initialize http var to utilize REST API
var http = require('https');


/* INTENT HANDLERS */
const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
	},
	handle(handlerInput) {
		const attributes = handlerInput.attributesManager.getSessionAttributes();
	  attributes.stageNumber = 0;

		var speakOutput = "I am here to help you pick a restaurant. ";
		speakOutput += "What type of cuisine are you feeling like today? Italian? American?";

		var repromptOutput = "Hello? Please tell me what kind of food you crave right now. Japanese? Italian? French?";

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(repromptOutput)
			.getResponse();
	},
};

const CuisineHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside CuisineHandler");
		console.log(JSON.stringify(request));
		
		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "CuisineIntent") &&
           (attributes.stageNumber === 0);
	},
	handle(handlerInput) {
		console.log("Inside CuisineHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const foodType = slots['FoodType'].value;

		attributes.foodType = foodType;
		attributes.stageNumber += 1;

		var speakOutput = "Now, in what city are you looking for restaurants?";
		var repromptOutput = "Can you please tell me in what city you want to find restaurants?";

		return response.speak(speakOutput)
									 .reprompt(repromptOutput)
									 .getResponse();
	},

};

const LocationHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside LocationHandler");
		console.log(JSON.stringify(request));

		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "LocationIntent") &&
           (attributes.stageNumber === 1);
	},
	handle(handlerInput) {
		console.log("Inside LocationHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const city = slots['City'].value;

		attributes.city = city;
		attributes.stageNumber += 1;
		var foodType = attributes.foodType;
		
		var speakOutput = "Based on what you told me, you want to look for " + foodType + " in " + city + ". ";
		speakOutput += "Is this correct?";
		
		var repromptOutput = "Can you please confirm? Please say yes or no.";

		return response.speak(speakOutput)
									 .reprompt(repromptOutput)
									 .getResponse();
	},
};

const ResultHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside ResultHandler");
		console.log(JSON.stringify(request));

		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "YesOrNoIntent") &&
           (attributes.stageNumber === 2);
	},
	async handle(handlerInput) {
		console.log("Inside ResultHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const yesorno = slots['Confirmation'].value;

		var speakOutput = " ";
		
		if (yesorno === "no"){
			speakOutput += "Please restart this skill.";
		} else {
			// Call GET to Yelp API using the helper function httpGet() below
			var foodType = attributes.foodType;
			var city = attributes.city;

			const APIresponse = await httpGet(foodType,city);
			console.log(APIresponse);
			attributes.NameOfRestaurantOne = APIresponse.businesses[0].name;
			attributes.NameOfRestaurantTwo = APIresponse.businesses[1].name;
			attributes.NameOfRestaurantThree = APIresponse.businesses[2].name;

			speakOutput += "I found some most reviewed restaurants from Yelp that are open right now. I recommend checking out ";
			speakOutput += attributes.NameOfRestaurantOne + ". Perhaps check out " + attributes.NameOfRestaurantTwo + ". ";
			speakOutput += "Or, " + attributes.NameOfRestaurantThree + ". Bon appetit!";
		}

		// var APIresponse = await testHttpGet();
		// console.log(APIresponse);

		// speakOutput += APIresponse.value.joke;

		return handlerInput.responseBuilder.speak(speakOutput).getResponse(false);
	},
};

const HelpHandler = {
	canHandle(handlerInput) {
		console.log("Inside HelpHandler");
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' &&
					 request.intent.name === 'AMAZON.HelpHandler';
	},
	handle(handlerInput) {
		console.log("Inside HelpHandler - handle");
		return handlerInput.responseBuilder
			.speak(helpMessage)
			.reprompt(helpMessage)
			.getResponse();
	},
};

const ExitHandler = {
	canHandle(handlerInput) {
		console.log("Inside ExitHandler");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const request = handlerInput.requestEnvelope.request;

		return request.type === `IntentRequest` && (
							request.intent.name === 'AMAZON.StopIntent' ||
							request.intent.name === 'AMAZON.PauseIntent' ||
							request.intent.name === 'AMAZON.CancelIntent'
					 );
	},
	handle(handlerInput) {

		return handlerInput.responseBuilder
			.speak("Good bye.")
			.getResponse();
	},
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		console.log("Inside SessionEndedRequestHandler");
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
		return handlerInput.responseBuilder.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		console.log("Inside ErrorHandler");
		return true;
	},
	handle(handlerInput, error) {
		console.log("Inside ErrorHandler - handle");
		console.log(`Error handled: ${JSON.stringify(error)}`);
		console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);

		return handlerInput.responseBuilder
			.speak(helpMessage)
			.reprompt(helpMessage)
			.getResponse();
	},
};

const helpMessage = "I didn't quite get that. Can you please say that again?"

// https://api.yelp.com/v3/businesses/search?term=korean&location=02142&limit=3&sort_by=review_count&open_now=true&radius=4800
function httpGet(keyTerm,location) {
  return new Promise(((resolve, reject) => {
	var options = {
		host: 'api.yelp.com',
		path: '/v3/businesses/search?term='+keyTerm+'&location='+location+'&limit=3&sort_by=review_count&open_now=true&radius=4800',
		method: 'GET',
		headers: {
					Authorization: 'Bearer 5vLai0RfI-OP7kCK4041R9pu86fDydKYRs-K64YVdjEUunLnw508qogHf4ZGhTdSKJ6XYuXZJDxevR07pnSZlZT0jkKLM9b7TKQ19m0D0GUYYLHXl5gciIKYqfvlXHYx'
				},
	};
	
	const request = http.request(options, (response) => {
	  response.setEncoding('utf8');
	  let returnData = '';

	  response.on('data', (chunk) => {
		returnData += chunk;
	  });

	  response.on('end', () => {
		resolve(JSON.parse(returnData));
	  });

	  response.on('error', (error) => {
		reject(error);
	  });
	});

	request.end();
  }));
}

// function testHttpGet() {
//   return new Promise(((resolve, reject) => {
//     var options = {
//         host: 'api.icndb.com',
//         port: 443,
//         path: '/jokes/random',
//         method: 'GET',
//     };
	
//     const request = http.request(options, (response) => {
//       // response.setEncoding('utf8');
//       let returnData = '';

//       response.on('data', (chunk) => {
//         returnData += chunk;
//       });

//       response.on('end', () => {
//         resolve(JSON.parse(returnData));
//       });

//       response.on('error', (error) => {
//         reject(error);
//       });
//     });

//     request.end();

//   }));
// }

/* LAMBDA SETUP */
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		CuisineHandler,
		LocationHandler,
		ResultHandler,
		HelpHandler,
		ExitHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();
