import * as limbo from "limbo";
import ollama from "ollama";

export function activate() {
	// todo, consider settings for ollama host, port, ...

	// --- llms ---

	limbo.llms.register({
		id: "llama3",
		name: "llama3",
		description: "Meta Llama 3: The most capable openly available LLM to date",
		generateText: async ({ promptBuilder, onChunk }) => {
			// const systemPrompt = promptBuilder.getSystemPrompt();
			const userPrompt = promptBuilder.getUserPrompt();

			const response = await ollama.chat({
				model: "llama3",
				stream: true,
				messages: [
					{
						role: "user",
						content: userPrompt,
					},
				],
			});

			for await (const chunk of response) {
				onChunk(chunk.message.content);
			}
		},
	});
}
