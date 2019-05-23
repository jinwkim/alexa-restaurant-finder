const Alexa = require('ask-sdk-core');

// Initialize http var for REST to IRIS
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
		console.log("Inside NameHandler");
		console.log(JSON.stringify(request));
		
		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "NameIntent") &&
					 (attributes.stageNumber === 1);
	},
	handle(handlerInput) {
		console.log("Inside NameHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const firstName = slots['FirstName'].value;
		const lastName = slots['LastName'].value;

		attributes.firstName = firstName;
		attributes.lastName = lastName;
		attributes.stageNumber += 1;

		var speakOutput = "Thank you " + firstName + ". Now, tell me the month, day, and the year of your date of birth.";
		var repromptOutput = "Are you still there? Please tell me your date of birth.";

		return response.speak(speakOutput)
									 .reprompt(repromptOutput)
									 .getResponse();
	},

};

const LocationHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside DOBHandler");
		console.log(JSON.stringify(request));

		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "DOBIntent") &&
					 (attributes.stageNumber === 2);
	},
	handle(handlerInput) {
		console.log("Inside DOBHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const dateOfBirth = slots['DOB'].value;

		attributes.DOB = dateOfBirth;
		attributes.stageNumber += 1;
		
		var firstName = "";

		if (attributes.hasOwnProperty('firstName')){
			firstName = attributes.firstName;
		}

		var speakOutput = "Next, on a 0 to 10 pain scale, tell me the intensity of your pain by saying 0 if you have no pain, or 10 if you need immediate assistance.";
		var repromptOutput = "Are you still there? Please tell me how you feel on a scale 0 to 10.";

		return response.speak(speakOutput)
									 .reprompt(repromptOutput)
									 .getResponse();
	},
};

const FeelingHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside FeelingHandler");
		console.log(JSON.stringify(request));

		const attributes = handlerInput.attributesManager.getSessionAttributes();

		return request.type === "IntentRequest" &&
					 (request.intent.name === "FeelingIntent") &&
					 (attributes.stageNumber === 3);
	},
	handle(handlerInput) {
		console.log("Inside FeelingHandler - handle");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const response = handlerInput.responseBuilder;

		const slots = handlerInput.requestEnvelope.request.intent.slots;
		const feelingRating = slots['FeelingRating'].value;

		attributes.feelingRating = feelingRating;

		var speakOutput = "";

		if (feelingRating === 0) {
			speakOutput += "Great to hear that you are doing well. I will record your pain level as " + feelingRating + ". Good bye.";
		}
		if (feelingRating >7) {
			speakOutput += "Ouch. I will record your pain level as " + feelingRating + ", and send for help right away. ";
			speakOutput += "InterSystems will also examine your Unified Care Record, and let your doctors know of any related diagnosis or medication that might be causing your pain. ";
			speakOutput += "Hope you feel better soon. Good bye."
		}
		if (feelingRating > 0 && feelingRating < 8 ) {
			speakOutput += "I will record your pain level as " + feelingRating + ". ";
			speakOutput += "InterSystems will process your pain level, examine your Unified Care Record, and let your doctors know of any related diagnosis or medication that might be causing your pain. ";
			speakOutput += "Hope you feel better soon. Good bye. ";
		}

		// INSERT POST / GET
		SubmitToIRIS(attributes);

		return response.speak(speakOutput)
										.withShouldEndSession(true)
										.getResponse(false);
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
		// code to export message as file and feed into IRIS

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
				host: 'numbersapi.com',
				path: '/' + encodeURIComponent(query),
				method: 'GET',
				headers: {
						'Authorization': 'Bearer 5vLai0RfI-OP7kCK4041R9pu86fDydKYRs-K64YVdjEUunLnw508qogHf4ZGhTdSKJ6XYuXZJDxevR07pnSZlZT0jkKLM9b7TKQ19m0D0GUYYLHXl5gciIKYqfvlXHYx'
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

const helpMessage = "I didn't quite get that. Please tell me again."

/* LAMBDA SETUP */
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		CuisineHandler,
		LocationHandler,
		HelpHandler,
		ExitHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();