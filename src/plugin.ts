import * as limbo from "limbo";
import ollama from "ollama/browser";

export default {
	onActivate: async () => {
		// limbo.settings.register({
		// 	id: "host",
		// 	type: "text",
		// 	label: "Ollama host",
		// 	description: "The Ollama host URL",
		// 	defaultValue: "http://localhost:11434",
		// 	placeholder: "http://localhost:11434",
		// });

		// --- llms ---

		const listResult = await ollama.list();

		for (const model of listResult.models) {
			limbo.models.registerLLM({
				id: model.name,
				name: model.name,
				description: `Ollama model: ${model.name}`,
				generateText: async ({ promptBuilder, onChunk }) => {
					const messages = promptBuilder.getMessages();

					const response = await ollama.chat({
						model: model.name,
						stream: true,
						messages,
					});

					for await (const chunk of response) {
						onChunk(chunk.message.content);
					}
				},
			});
		}
	},
} satisfies limbo.Plugin;
