// lib/cohere.js
import { cohere } from "../../lib/cohere";
import { CohereClient } from "cohere-ai";

export const cohere = new CohereClient({
  apiKey: process.env.COHERE_API_KEY,
});
