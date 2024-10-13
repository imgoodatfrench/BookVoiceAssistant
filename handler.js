import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"; 
import { secretAccessKey } from './ENV.js'; // Import the key
import fs from 'fs';

const config = {
    region: "us-west-2",
    credentials: {
        accessKeyId: "AKIAQKPIMC2ZQGESJ4AH",
        secretAccessKey: secretAccessKey
    }
};

const client = new BedrockRuntimeClient(config);

async function textHandler(textInput) {
    const input = {
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        messages: [
            {
            role: 'user',
            content: [
                {
                text: textInput,
                },
                { 
                image: { // ImageBlock
                    format: "png", // required
                    source: { // ImageSource Union: only one key present
                        bytes: new Uint8Array(fs.readFileSync('testImage.png')), // Read and convert the image file
                    },
                },
                }
            ]
            }
        ],

        system: [
            {
            text: 'System message here',
            }
        ],
        inferenceConfig: {
            maxToasdfasdfkens: 150,
            temperature: 0.7,
            topP: 0.9,
        }
    };
    try {
        const command = new ConverseCommand(input);
        const response = await client.send(command);
        console.log(`RETURN MESSAGE: ${JSON.stringify(response.output.message.content)}`);
        console.log(`Total tokens: ${JSON.stringify(response.usage)}`);
    } catch (error) {
        console.error(error);
    }
}

//to test
textHandler("write me a 150 word fictional backstory about the image in a fanfic fashion")
