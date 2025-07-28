/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI} from '@google/genai';
import {marked} from 'marked';

// Helper to append markdown content to a container
async function debug(container: HTMLElement, ...parts: string[]) {
  const turn = document.createElement('div');
  const markdown = parts.join('');
  turn.innerHTML = await marked.parse(markdown ?? '');
  container.append(turn);
}

// Creates a styled container for each example run
function createExampleContainer(title: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'example-container';

  const header = document.createElement('h2');
  header.textContent = title;
  container.append(header);

  document.body.append(container);
  return container;
}

// Generic function to run a prompt with code execution
async function runCodeExecution(container: HTMLElement, prompt: string) {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  await debug(container, `**Prompt:**\n\n> ${prompt.replace(/\n/g, '\n> ')}`);
  await debug(container, `*Generating...*`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{codeExecution: {}}],
      },
    });

    const modelResponseText = response.text;
    if (modelResponseText) {
      await debug(container, `**Model Response:**\n\n${modelResponseText}`);
    }

    if (response.executableCode) {
      await debug(
        container,
        '**Executable Code:**\n```python\n' + response.executableCode + '\n```'
      );
    }
    
    if (response.codeExecutionResult) {
      await debug(
        container,
        '**Execution Result:**\n```\n' + response.codeExecutionResult + '\n```'
      );
    }
  } catch (e) {
    const error = e as Error;
    await debug(container, `**An error occurred:** ${error.message}`);
  }
}

async function main() {
  const primeContainer = createExampleContainer(
    'Default Python (3) Example: Sum of Primes'
  );
  await runCodeExecution(
    primeContainer,
    'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
  );

  const python3Container = createExampleContainer('Python 3 Syntax Example');
  await runCodeExecution(
    python3Container,
    'Using python 3 syntax, print("Hello from Python 3").'
  );

  const python2Container = createExampleContainer('Python 2 Syntax Example');
  await runCodeExecution(
    python2Container,
    'Using python 2 syntax, print "Hello from Python 2".\n\n*Note: The code execution sandbox uses Python 3, so code using Python 2-specific syntax like the `print` statement is expected to fail.*'
  );
}

main();
