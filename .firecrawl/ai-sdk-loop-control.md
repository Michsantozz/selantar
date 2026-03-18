- [Docs](https://ai-sdk.dev/docs)
- [Cookbook](https://ai-sdk.dev/cookbook)
- [Providers](https://ai-sdk.dev/providers)
- [Tools RegistryTools](https://ai-sdk.dev/tools-registry)
- [Playground](https://ai-sdk.dev/playground)
- [AI ElementsElements](https://elements.ai-sdk.dev/)
- [AI GatewayGateway](https://vercel.com/ai-gateway)

Search…
`⌘ K`

Feedback

Sign in with Vercel

Sign in with Vercel

Menu

v6 (Latest)

AI SDK 6.x

[AI SDK by Vercel](https://ai-sdk.dev/docs/introduction)

[Foundations](https://ai-sdk.dev/docs/foundations)

[Overview](https://ai-sdk.dev/docs/foundations/overview)

[Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)

[Prompts](https://ai-sdk.dev/docs/foundations/prompts)

[Tools](https://ai-sdk.dev/docs/foundations/tools)

[Streaming](https://ai-sdk.dev/docs/foundations/streaming)

[Provider Options](https://ai-sdk.dev/docs/foundations/provider-options)

[Getting Started](https://ai-sdk.dev/docs/getting-started)

[Choosing a Provider](https://ai-sdk.dev/docs/getting-started/choosing-a-provider)

[Navigating the Library](https://ai-sdk.dev/docs/getting-started/navigating-the-library)

[Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

[Next.js Pages Router](https://ai-sdk.dev/docs/getting-started/nextjs-pages-router)

[Svelte](https://ai-sdk.dev/docs/getting-started/svelte)

[Vue.js (Nuxt)](https://ai-sdk.dev/docs/getting-started/nuxt)

[Node.js](https://ai-sdk.dev/docs/getting-started/nodejs)

[Expo](https://ai-sdk.dev/docs/getting-started/expo)

[TanStack Start](https://ai-sdk.dev/docs/getting-started/tanstack-start)

[Coding Agents](https://ai-sdk.dev/docs/getting-started/coding-agents)

[Agents](https://ai-sdk.dev/docs/agents)

[Overview](https://ai-sdk.dev/docs/agents/overview)

[Building Agents](https://ai-sdk.dev/docs/agents/building-agents)

[Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)

[Loop Control](https://ai-sdk.dev/docs/agents/loop-control)

[Configuring Call Options](https://ai-sdk.dev/docs/agents/configuring-call-options)

[Memory](https://ai-sdk.dev/docs/agents/memory)

[Subagents](https://ai-sdk.dev/docs/agents/subagents)

[AI SDK Core](https://ai-sdk.dev/docs/ai-sdk-core)

[Overview](https://ai-sdk.dev/docs/ai-sdk-core/overview)

[Generating Text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text)

[Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)

[Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

[Model Context Protocol (MCP)](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools)

[Prompt Engineering](https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering)

[Settings](https://ai-sdk.dev/docs/ai-sdk-core/settings)

[Embeddings](https://ai-sdk.dev/docs/ai-sdk-core/embeddings)

[Reranking](https://ai-sdk.dev/docs/ai-sdk-core/reranking)

[Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation)

[Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription)

[Speech](https://ai-sdk.dev/docs/ai-sdk-core/speech)

[Video Generation](https://ai-sdk.dev/docs/ai-sdk-core/video-generation)

[Language Model Middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware)

[Provider & Model Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)

[Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing)

[Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry)

[DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools)

[Event Callbacks](https://ai-sdk.dev/docs/ai-sdk-core/event-listeners)

[AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-ui)

[Overview](https://ai-sdk.dev/docs/ai-sdk-ui/overview)

[Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)

[Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)

[Chatbot Resume Streams](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams)

[Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)

[Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

[Completion](https://ai-sdk.dev/docs/ai-sdk-ui/completion)

[Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)

[Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-ui/error-handling)

[Transport](https://ai-sdk.dev/docs/ai-sdk-ui/transport)

[Reading UIMessage Streams](https://ai-sdk.dev/docs/ai-sdk-ui/reading-ui-message-streams)

[Message Metadata](https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata)

[Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)

[AI SDK RSC](https://ai-sdk.dev/docs/ai-sdk-rsc)

[Advanced](https://ai-sdk.dev/docs/advanced)

[Reference](https://ai-sdk.dev/docs/reference)

[AI SDK Core](https://ai-sdk.dev/docs/reference/ai-sdk-core)

[AI SDK UI](https://ai-sdk.dev/docs/reference/ai-sdk-ui)

[AI SDK RSC](https://ai-sdk.dev/docs/reference/ai-sdk-rsc)

[AI SDK Errors](https://ai-sdk.dev/docs/reference/ai-sdk-errors)

[Migration Guides](https://ai-sdk.dev/docs/migration-guides)

[Troubleshooting](https://ai-sdk.dev/docs/troubleshooting)

[Coding Agents](https://ai-sdk.dev/docs/getting-started/coding-agents)Loop Control

Copy markdown

# [Loop Control](https://ai-sdk.dev/docs/agents/loop-control\#loop-control)

You can control both the execution flow and the settings at each step of the agent loop. The loop continues until:

- A finish reasoning other than tool-calls is returned, or
- A tool that is invoked does not have an execute function, or
- A tool call needs approval, or
- A stop condition is met

The AI SDK provides built-in loop control through two parameters: `stopWhen` for defining stopping conditions and `prepareStep` for modifying settings (model, tools, messages, and more) between steps.

## [Stop Conditions](https://ai-sdk.dev/docs/agents/loop-control\#stop-conditions)

The `stopWhen` parameter controls when to stop execution when there are tool results in the last step. By default, agents stop after 20 steps using `stepCountIs(20)`.

When you provide `stopWhen`, the agent continues executing after tool calls until a stopping condition is met. When the condition is an array, execution stops when any of the conditions are met.

### [Use Built-in Conditions](https://ai-sdk.dev/docs/agents/loop-control\#use-built-in-conditions)

The AI SDK provides several built-in stopping conditions:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent, stepCountIs } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: "anthropic/claude-sonnet-4.5",

5  tools: {

6    // your tools

7  },

8  stopWhen: stepCountIs(20), // Default state: stop after 20 steps maximum

9});

10

11const result = await agent.generate({

12  prompt: 'Analyze this dataset and create a summary report',

13});
```

### [Combine Multiple Conditions](https://ai-sdk.dev/docs/agents/loop-control\#combine-multiple-conditions)

Combine multiple stopping conditions. The loop stops when it meets any condition:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent, stepCountIs, hasToolCall } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: "anthropic/claude-sonnet-4.5",

5  tools: {

6    // your tools

7  },

8  stopWhen: [\
\
9    stepCountIs(20), // Maximum 20 steps\
\
10    hasToolCall('someTool'), // Stop after calling 'someTool'\
\
11  ],

12});

13

14const result = await agent.generate({

15  prompt: 'Research and analyze the topic',

16});
```

### [Create Custom Conditions](https://ai-sdk.dev/docs/agents/loop-control\#create-custom-conditions)

Build custom stopping conditions for specific requirements:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent, StopCondition, ToolSet } from 'ai';

2

3const tools = {

4  // your tools

5} satisfies ToolSet;

6

7const hasAnswer: StopCondition<typeof tools> = ({ steps }) => {

8  // Stop when the model generates text containing "ANSWER:"

9  return steps.some(step => step.text?.includes('ANSWER:')) ?? false;

10};

11

12const agent = new ToolLoopAgent({

13  model: "anthropic/claude-sonnet-4.5",

14  tools,

15  stopWhen: hasAnswer,

16});

17

18const result = await agent.generate({

19  prompt: 'Find the answer and respond with "ANSWER: [your answer]"',

20});
```

Custom conditions receive step information across all steps:

```ts
1const budgetExceeded: StopCondition<typeof tools> = ({ steps }) => {

2  const totalUsage = steps.reduce(

3    (acc, step) => ({

4      inputTokens: acc.inputTokens + (step.usage?.inputTokens ?? 0),

5      outputTokens: acc.outputTokens + (step.usage?.outputTokens ?? 0),

6    }),

7    { inputTokens: 0, outputTokens: 0 },

8  );

9

10  const costEstimate =

11    (totalUsage.inputTokens * 0.01 + totalUsage.outputTokens * 0.03) / 1000;

12  return costEstimate > 0.5; // Stop if cost exceeds $0.50

13};
```

## [Prepare Step](https://ai-sdk.dev/docs/agents/loop-control\#prepare-step)

The `prepareStep` callback runs before each step in the loop and defaults to the initial settings if you don't return any changes. Use it to modify settings, manage context, or implement dynamic behavior based on execution history.

### [Dynamic Model Selection](https://ai-sdk.dev/docs/agents/loop-control\#dynamic-model-selection)

Switch models based on step requirements:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: 'openai/gpt-4o-mini', // Default model

5  tools: {

6    // your tools

7  },

8  prepareStep: async ({ stepNumber, messages }) => {

9    // Use a stronger model for complex reasoning after initial steps

10    if (stepNumber > 2 && messages.length > 10) {

11      return {

12        model: "anthropic/claude-sonnet-4.5",

13      };

14    }

15    // Continue with default settings

16    return {};

17  },

18});

19

20const result = await agent.generate({

21  prompt: '...',

22});
```

### [Context Management](https://ai-sdk.dev/docs/agents/loop-control\#context-management)

Manage growing conversation history in long-running loops:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: "anthropic/claude-sonnet-4.5",

5  tools: {

6    // your tools

7  },

8  prepareStep: async ({ messages }) => {

9    // Keep only recent messages to stay within context limits

10    if (messages.length > 20) {

11      return {

12        messages: [\
\
13          messages[0], // Keep system instructions\
\
14          ...messages.slice(-10), // Keep last 10 messages\
\
15        ],

16      };

17    }

18    return {};

19  },

20});

21

22const result = await agent.generate({

23  prompt: '...',

24});
```

### [Tool Selection](https://ai-sdk.dev/docs/agents/loop-control\#tool-selection)

Control which tools are available at each step:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: "anthropic/claude-sonnet-4.5",

5  tools: {

6    search: searchTool,

7    analyze: analyzeTool,

8    summarize: summarizeTool,

9  },

10  prepareStep: async ({ stepNumber, steps }) => {

11    // Search phase (steps 0-2)

12    if (stepNumber <= 2) {

13      return {

14        activeTools: ['search'],

15        toolChoice: 'required',

16      };

17    }

18

19    // Analysis phase (steps 3-5)

20    if (stepNumber <= 5) {

21      return {

22        activeTools: ['analyze'],

23      };

24    }

25

26    // Summary phase (step 6+)

27    return {

28      activeTools: ['summarize'],

29      toolChoice: 'required',

30    };

31  },

32});

33

34const result = await agent.generate({

35  prompt: '...',

36});
```

You can also force a specific tool to be used:

```ts
1prepareStep: async ({ stepNumber }) => {

2  if (stepNumber === 0) {

3    // Force the search tool to be used first

4    return {

5      toolChoice: { type: 'tool', toolName: 'search' },

6    };

7  }

8

9  if (stepNumber === 5) {

10    // Force the summarize tool after analysis

11    return {

12      toolChoice: { type: 'tool', toolName: 'summarize' },

13    };

14  }

15

16  return {};

17};
```

### [Message Modification](https://ai-sdk.dev/docs/agents/loop-control\#message-modification)

Transform messages before sending them to the model:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent } from 'ai';

2

3const agent = new ToolLoopAgent({

4  model: "anthropic/claude-sonnet-4.5",

5  tools: {

6    // your tools

7  },

8  prepareStep: async ({ messages, stepNumber }) => {

9    // Summarize tool results to reduce token usage

10    const processedMessages = messages.map(msg => {

11      if (msg.role === 'tool' && msg.content.length > 1000) {

12        return {

13          ...msg,

14          content: summarizeToolResult(msg.content),

15        };

16      }

17      return msg;

18    });

19

20    return { messages: processedMessages };

21  },

22});

23

24const result = await agent.generate({

25  prompt: '...',

26});
```

## [Access Step Information](https://ai-sdk.dev/docs/agents/loop-control\#access-step-information)

Both `stopWhen` and `prepareStep` receive detailed information about the current execution:

```ts
1prepareStep: async ({

2  model, // Current model configuration

3  stepNumber, // Current step number (0-indexed)

4  steps, // All previous steps with their results

5  messages, // Messages to be sent to the model

6}) => {

7  // Access previous tool calls and results

8  const previousToolCalls = steps.flatMap(step => step.toolCalls);

9  const previousResults = steps.flatMap(step => step.toolResults);

10

11  // Make decisions based on execution history

12  if (previousToolCalls.some(call => call.toolName === 'dataAnalysis')) {

13    return {

14      toolChoice: { type: 'tool', toolName: 'reportGenerator' },

15    };

16  }

17

18  return {};

19},
```

## [Forced Tool Calling](https://ai-sdk.dev/docs/agents/loop-control\#forced-tool-calling)

You can force the agent to always use tools by combining `toolChoice: 'required'` with a `done` tool that has no `execute` function. This pattern ensures the agent uses tools for every step and stops only when it explicitly signals completion.

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent, tool } from 'ai';

2import { z } from 'zod';

3

4const agent = new ToolLoopAgent({

5  model: "anthropic/claude-sonnet-4.5",

6  tools: {

7    search: searchTool,

8    analyze: analyzeTool,

9    done: tool({

10      description: 'Signal that you have finished your work',

11      inputSchema: z.object({

12        answer: z.string().describe('The final answer'),

13      }),

14      // No execute function - stops the agent when called

15    }),

16  },

17  toolChoice: 'required', // Force tool calls at every step

18});

19

20const result = await agent.generate({

21  prompt: 'Research and analyze this topic, then provide your answer.',

22});

23

24// extract answer from done tool call

25const toolCall = result.staticToolCalls[0]; // tool call from final step

26if (toolCall?.toolName === 'done') {

27  console.log(toolCall.input.answer);

28}
```

Key aspects of this pattern:

- **`toolChoice: 'required'`**: Forces the model to call a tool at every step instead of generating text directly. This ensures the agent follows a structured workflow.
- **`done` tool without `execute`**: A tool that has no `execute` function acts as a termination signal. When the agent calls this tool, the loop stops because there's no function to execute.
- **Accessing results**: The final answer is available in `result.staticToolCalls`, which contains tool calls that weren't executed.

This pattern is useful when you want the agent to always use specific tools for operations (like code execution or data retrieval) rather than attempting to answer directly.

## [Manual Loop Control](https://ai-sdk.dev/docs/agents/loop-control\#manual-loop-control)

For scenarios requiring complete control over the agent loop, you can use AI SDK Core functions (`generateText` and `streamText`) to implement your own loop management instead of using `stopWhen` and `prepareStep`. This approach provides maximum flexibility for complex workflows.

### [Implementing a Manual Loop](https://ai-sdk.dev/docs/agents/loop-control\#implementing-a-manual-loop)

Build your own agent loop when you need full control over execution:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { generateText, ModelMessage } from 'ai';

2

3const messages: ModelMessage[] = [{ role: 'user', content: '...' }];

4

5let step = 0;

6const maxSteps = 10;

7

8while (step < maxSteps) {

9  const result = await generateText({

10    model: "anthropic/claude-sonnet-4.5",

11    messages,

12    tools: {

13      // your tools here

14    },

15  });

16

17  messages.push(...result.response.messages);

18

19  if (result.text) {

20    break; // Stop when model generates text

21  }

22

23  step++;

24}
```

This manual approach gives you complete control over:

- Message history management
- Step-by-step decision making
- Custom stopping conditions
- Dynamic tool and model selection
- Error handling and recovery

[Learn more about manual agent loops in the cookbook](https://ai-sdk.dev/cookbook/node/manual-agent-loop).

[Previous\\
Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)

[Next\\
Configuring Call Options](https://ai-sdk.dev/docs/agents/configuring-call-options)

On this page

[Loop Control](https://ai-sdk.dev/docs/agents/loop-control#loop-control)

[Stop Conditions](https://ai-sdk.dev/docs/agents/loop-control#stop-conditions)

[Use Built-in Conditions](https://ai-sdk.dev/docs/agents/loop-control#use-built-in-conditions)

[Combine Multiple Conditions](https://ai-sdk.dev/docs/agents/loop-control#combine-multiple-conditions)

[Create Custom Conditions](https://ai-sdk.dev/docs/agents/loop-control#create-custom-conditions)

[Prepare Step](https://ai-sdk.dev/docs/agents/loop-control#prepare-step)

[Dynamic Model Selection](https://ai-sdk.dev/docs/agents/loop-control#dynamic-model-selection)

[Context Management](https://ai-sdk.dev/docs/agents/loop-control#context-management)

[Tool Selection](https://ai-sdk.dev/docs/agents/loop-control#tool-selection)

[Message Modification](https://ai-sdk.dev/docs/agents/loop-control#message-modification)

[Access Step Information](https://ai-sdk.dev/docs/agents/loop-control#access-step-information)

[Forced Tool Calling](https://ai-sdk.dev/docs/agents/loop-control#forced-tool-calling)

[Manual Loop Control](https://ai-sdk.dev/docs/agents/loop-control#manual-loop-control)

[Implementing a Manual Loop](https://ai-sdk.dev/docs/agents/loop-control#implementing-a-manual-loop)

Deploy and Scale AI Apps with Vercel

Deliver AI experiences globally with one push.

Trusted by industry leaders:

- OpenAI
- Photoroom
- ![leonardo-ai Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fleonardo-ai-light.9d99f867.svg&w=640&q=75&dpl=dpl_4zsWg5tyHcPR5nE97cdp6oKHsV7i)![leonardo-ai Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fleonardo-ai-dark.a432f6e6.svg&w=640&q=75&dpl=dpl_4zsWg5tyHcPR5nE97cdp6oKHsV7i)
- ![zapier Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzapier-light.5dde0542.svg&w=256&q=75&dpl=dpl_4zsWg5tyHcPR5nE97cdp6oKHsV7i)![zapier Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzapier-dark.828a0308.svg&w=256&q=75&dpl=dpl_4zsWg5tyHcPR5nE97cdp6oKHsV7i)

[Sign Up](https://vercel.com/signup?utm_source=ai-sdk_site&utm_medium=docs_card&utm_content=sign-up)

#### Resources

[Docs](https://ai-sdk.dev/docs) [Cookbook](https://ai-sdk.dev/cookbook) [Providers](https://ai-sdk.dev/providers) [Tools Registry](https://ai-sdk.dev/tools-registry) [Showcase](https://ai-sdk.dev/showcase) [GitHub](https://github.com/vercel/ai) [Discussions](https://github.com/vercel/ai/discussions)

#### More

[Playground](https://ai-sdk.dev/playground) [Workflow Dev Kit](https://useworkflow.dev/) [Flags SDK](https://flags-sdk.dev/) [Contact Sales](https://vercel.com/contact/sales)

#### About Vercel

[Next.js + Vercel](https://vercel.com/frameworks/nextjs) [Open Source Software](https://vercel.com/oss) [GitHub](https://github.com/vercel) [X](https://x.com/vercel)

#### Legal

[Privacy Policy](https://vercel.com/legal/privacy-policy)

© 2026 Vercel, Inc.