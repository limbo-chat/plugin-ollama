import * as limbo from "@limbo/api";
import ollama from "ollama/browser";
import {
	convertMessagesToOpenAICompatible,
	convertToolsToOpenAICompatible,
	FetchAdapter,
	OpenAICompatibleClient,
	streamOpenAICompatibleChatCompletion,
} from "@limbo/openai-utils";

/*
  Considerations:

  If the user changes the host after the plugin is activated, the plugin will not refetch the models again.
  Also, generateText should always access the most recent settings (such as the ollama host)

  *There may need to be a way to watch settings in the plugin API*
*/

export default {
	onActivate: async () => {
		limbo.commands.register({
			id: "refresh-models",
			name: "Refresh Models",
			execute: async () => {
				console.log("refreshing ollama models");
			},
		});
		// temp, not doing anything with the settings yet

		limbo.settings.register({
			id: "host",
			type: "text",
			label: "Ollama host",
			description: "The Ollama host URL",
			defaultValue: "http://localhost:11434",
			placeholder: "http://localhost:11434",
		});

		// --- llms ---

		const listResult = await ollama.list();

		for (const model of listResult.models) {
			limbo.models.registerLLM({
				id: model.name,
				name: model.name,
				description: `Ollama model: ${model.name}`,
				capabilities: [],
				chat: async ({ messages, tools, onText, abortSignal }) => {
					const client = new OpenAICompatibleClient({
						adapter: new FetchAdapter(),
						baseUrl: "http://localhost:11434/v1",
					});

					const openaiTools = convertToolsToOpenAICompatible(tools);
					const openaiMessages = convertMessagesToOpenAICompatible(messages);

					console.log("openaiTools", openaiTools);

					const stream = streamOpenAICompatibleChatCompletion(client, {
						model: model.name,
						tools: openaiTools,
						messages: openaiMessages,
						abortSignal,
					});

					for await (const chunk of stream) {
						const text = chunk.content;

						console.log("chunk", chunk);

						if (text) {
							onText(text);
						}
					}

					// const response = await ollama.chat({
					// 	model: model.name,
					// 	stream: true,
					// 	// tools: adaptedTools,
					// 	messages: [
					// 		{
					// 			role: "assistant",
					// 			content: "",
					// 		},
					// 	],
					// });
				},
			});
		}
	},
} satisfies limbo.Plugin;
