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

[Coding Agents](https://ai-sdk.dev/docs/getting-started/coding-agents)Overview

Copy markdown

# [Agents](https://ai-sdk.dev/docs/agents/overview\#agents)

Agents are **large language models (LLMs)** that use **tools** in a **loop** to accomplish tasks.

These components work together:

- **LLMs** process input and decide the next action
- **Tools** extend capabilities beyond text generation (reading files, calling APIs, writing to databases)
- **Loop**orchestrates execution through:
  - **Context management** \- Maintaining conversation history and deciding what the model sees (input) at each step
  - **Stopping conditions** \- Determining when the loop (task) is complete

## [ToolLoopAgent Class](https://ai-sdk.dev/docs/agents/overview\#toolloopagent-class)

The ToolLoopAgent class handles these three components. Here's an agent that uses multiple tools in a loop to accomplish a task:

Gateway

Provider

Custom

Claude Sonnet 4.5

```ts
1import { ToolLoopAgent, stepCountIs, tool } from 'ai';

2import { z } from 'zod';

3

4const weatherAgent = new ToolLoopAgent({

5  model: "anthropic/claude-sonnet-4.5",

6  tools: {

7    weather: tool({

8      description: 'Get the weather in a location (in Fahrenheit)',

9      inputSchema: z.object({

10        location: z.string().describe('The location to get the weather for'),

11      }),

12      execute: async ({ location }) => ({

13        location,

14        temperature: 72 + Math.floor(Math.random() * 21) - 10,

15      }),

16    }),

17    convertFahrenheitToCelsius: tool({

18      description: 'Convert temperature from Fahrenheit to Celsius',

19      inputSchema: z.object({

20        temperature: z.number().describe('Temperature in Fahrenheit'),

21      }),

22      execute: async ({ temperature }) => {

23        const celsius = Math.round((temperature - 32) * (5 / 9));

24        return { celsius };

25      },

26    }),

27  },

28  // Agent's default behavior is to stop after a maximum of 20 steps

29  // stopWhen: stepCountIs(20),

30});

31

32const result = await weatherAgent.generate({

33  prompt: 'What is the weather in San Francisco in celsius?',

34});

35

36console.log(result.text); // agent's final answer

37console.log(result.steps); // steps taken by the agent
```

The agent automatically:

1. Calls the `weather` tool to get the temperature in Fahrenheit
2. Calls `convertFahrenheitToCelsius` to convert it
3. Generates a final text response with the result

The ToolLoopAgent handles the loop, context management, and stopping conditions.

## [Why Use the ToolLoopAgent?](https://ai-sdk.dev/docs/agents/overview\#why-use-the-toolloopagent)

The ToolLoopAgent is the recommended approach for building agents with the AI SDK because it:

- **Reduces boilerplate** \- Manages loops and message arrays
- **Improves reusability** \- Define once, use throughout your application
- **Simplifies maintenance** \- Single place to update agent configuration

For most use cases, start with the ToolLoopAgent. Use core functions (`generateText`, `streamText`) when you need explicit control over each step for complex structured workflows.

## [Structured Workflows](https://ai-sdk.dev/docs/agents/overview\#structured-workflows)

Agents are flexible and powerful, but non-deterministic. When you need reliable, repeatable outcomes with explicit control flow, use core functions with structured workflow patterns combining:

- Conditional statements for explicit branching
- Standard functions for reusable logic
- Error handling for robustness
- Explicit control flow for predictability

[Explore workflow patterns](https://ai-sdk.dev/docs/agents/workflows) to learn more about building structured, reliable systems.

## [Next Steps](https://ai-sdk.dev/docs/agents/overview\#next-steps)

- **[Building Agents](https://ai-sdk.dev/docs/agents/building-agents)** \- Guide to creating agents with the ToolLoopAgent
- **[Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)** \- Structured patterns using core functions for complex workflows
- **[Loop Control](https://ai-sdk.dev/docs/agents/loop-control)** \- Execution control with stopWhen and prepareStep

[Previous\\
Agents](https://ai-sdk.dev/docs/agents)

[Next\\
Building Agents](https://ai-sdk.dev/docs/agents/building-agents)

On this page

[Agents](https://ai-sdk.dev/docs/agents/overview#agents)

[ToolLoopAgent Class](https://ai-sdk.dev/docs/agents/overview#toolloopagent-class)

[Why Use the ToolLoopAgent?](https://ai-sdk.dev/docs/agents/overview#why-use-the-toolloopagent)

[Structured Workflows](https://ai-sdk.dev/docs/agents/overview#structured-workflows)

[Next Steps](https://ai-sdk.dev/docs/agents/overview#next-steps)

Deploy and Scale AI Apps with Vercel

Deliver AI experiences globally with one push.

Trusted by industry leaders:

- OpenAI
- Photoroom
- ![leonardo-ai Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fleonardo-ai-light.c7c240a2.svg&w=384&q=75&dpl=dpl_WNtbi6bEvnMfBXysVxXeHCZgVgQz)![leonardo-ai Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fleonardo-ai-dark.98769390.svg&w=384&q=75&dpl=dpl_WNtbi6bEvnMfBXysVxXeHCZgVgQz)
- ![zapier Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzapier-light.5dde0542.svg&w=256&q=75&dpl=dpl_WNtbi6bEvnMfBXysVxXeHCZgVgQz)![zapier Logo](https://ai-sdk.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzapier-dark.828a0308.svg&w=256&q=75&dpl=dpl_WNtbi6bEvnMfBXysVxXeHCZgVgQz)

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