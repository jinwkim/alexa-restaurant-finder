const Alexa = require('ask-sdk-core');

// Initialize http var to utilize REST API
var http = require('http');

/* INTENT HANDLERS */
const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
	},
	handle(handlerInput) {
		const attributes = handlerInput.attributesManager.getSessionAttributes();

		var speakOutput = "I am here to help you pick a restaurant. "
		speakOutput += "What type of cuisine are you feeling like today? Italian? American?"

		var repromptOutput = "Hello? Please tell me what kind of food you crave right now. Japanese? Italian? French?"

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
					 (request.intent.name === "CuisineIntent")
	},
	handle(handlerInput) {
		console.log("Inside CuisineHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const foodType = slots['FoodType'].value;

		attributes.foodType = foodType;

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
					 (request.intent.name === "LocationIntent")
	},
	handle(handlerInput) {
		console.log("Inside DOBHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const city = slots['City'].value;

		attributes.city = city;
		var foodType = attributes.foodType
		
		var speakOutput = "Based on what you told me, you want to look for " + foodType + " in " + city + ". ";
		speakOutput += "Is this correct? Please say yes or no.";
		
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
					 (request.intent.name === "YesOrNoIntent")
	},
	handle(handlerInput) {
		console.log("Inside DOBHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const yesorno = slots['Confirmation'].value;

		var speakOutput = "";
		
		if (yesorno == "yes"){
			// Call GET to Yelp API using the helper function httpGet() below

			speakOutput += "I recommend checking out the following restaurants. "

		} else {
			return response.speak("Please restart this skill.")
										.getResponse(false);
		}

		speakOutput += "Done!";

		return response.speak(speakOutput);
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

function httpGet(query, callback) {
		var options = {
				host: 'api.yelp.com',
				path: '/' + encodeURIComponent(query),
				method: 'GET',
				headers: {
						'Authorization': ''
					}
		};

		var req = http.request(options, res => {
				res.setEncoding('utf8');
				var responseString = "";
				
				//accept incoming data asynchronously
				res.on('data', chunk => {
						responseString = responseString + chunk;
				});
				
				//return the data when streaming is complete
				res.on('end', () => {
						console.log(responseString);
						callback(responseString);
				});

		});
		req.end();
}

const helpMessage = "I didn't quite get that. Can you please say that again?"

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