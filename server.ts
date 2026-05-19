import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // AI Clients
  let openai: OpenAI | null = null;
  const getOpenAI = () => {
    if (!openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && apiKey !== "MY_OPENAI_API_KEY" && apiKey.trim() !== "" && !apiKey.startsWith("sk-proj-FIXME")) {
        openai = new OpenAI({ apiKey });
      }
    }
    return openai;
  };

  const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // Interpretation using Gemini
  const interpretWithGemini = async (text: string, contactName: string, menuItems: any[] = []) => {
    const menuContext = menuItems.length > 0 
      ? `Considere o seguinte cardápio oficial: ${JSON.stringify(menuItems.map(i => ({ name: i.name, price: i.price })))}. 
         Use exatamente os nomes do cardápio se houver correspondência e calcule o totalGuess com base nesses preços.`
      : "";

    const prompt = `Interprete este pedido de marmitaria e extraia os itens, quantidades, observações, tipo de entrega (entrega ou retirada) e endereço.
      O nome do contato fornecido é "${contactName || 'Desconhecido'}". 
      Se o texto do pedido contiver um nome diferente para o cliente, use esse. 
      Se o texto NÃO contiver um nome mas o contato for conhecido, use "${contactName}".
      Se ambos forem desconhecidos ou genéricos, use null.
      
      Se o cliente pedir "para levar", "busco aí", "retirada", defina deliveryType como "retirada".
      Se o cliente fornecer um endereço ou pedir "entrega", "manda pra", defina deliveryType como "entrega".
      Se não estiver claro, defina como "desconhecido".
      
      Se faltar informações cruciais (como endereço para entrega, ou se o item for vago), adicione perguntas em suggestedQuestions.
      
      ${menuContext}
      
      Texto do pedido: "${text}"`;

    const response = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            deliveryType: { type: Type.STRING, enum: ["entrega", "retirada", "desconhecido"] },
            deliveryAddress: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  observation: { type: Type.STRING }
                },
                required: ["name", "quantity"]
              }
            },
            totalGuess: { type: Type.NUMBER },
            suggestedQuestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  };

  // API Routes
  app.post("/api/ai/interpret", async (req, res) => {
    const { text, contactName, menuItems } = req.body;
    let usedFallback = false;

    try {
      const client = getOpenAI();
      if (!client) {
        console.log("OpenAI not configured, falling back to Gemini...");
        const result = await interpretWithGemini(text, contactName, menuItems);
        return res.json({ ...result, _ai: "gemini" });
      }

      const menuContext = menuItems?.length > 0 
        ? `Cardápio oficial (use esses nomes e preços): ${JSON.stringify(menuItems.map((i: any) => ({ name: i.name, price: i.price })))}`
        : "Nenhum cardápio fornecido.";

      const prompt = `Interprete este pedido de marmitaria e extraia os itens, quantidades, observações, tipo de entrega e endereço.
        O nome do contato fornecido é "${contactName || 'Desconhecido'}". 
        Se o texto do pedido contiver um nome diferente para o cliente, use esse. 
        Se o texto NÃO contiver um nome mas o contato for conhecido, use "${contactName}".
        Se ambos forem desconhecidos ou genéricos, use null.
        
        ${menuContext}
        
        Regras para deliveryType: "entrega" (se houver endereço ou pedido de entrega), "retirada" (se o cliente buscar), "desconhecido" (se não souber).
        Extraia o deliveryAddress se mencionado.
        Se faltar o endereço para entrega, coloque "Qual o endereço para entrega?" em suggestedQuestions.
        Se algum item estiver ambíguo, adicione perguntas complementares em suggestedQuestions.
        
        Retorne APENAS um JSON válido seguindo este formato:
        {
          "customerName": "string ou null",
          "deliveryType": "entrega" | "retirada" | "desconhecido",
          "deliveryAddress": "string ou null",
          "items": [{"name": "string", "quantity": number, "observation": "string ou null"}],
          "totalGuess": number,
          "suggestedQuestions": ["string"]
        }
        
        Texto do pedido: "${text}"`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || "{}";
      res.json({ ...JSON.parse(content), _ai: "openai" });
    } catch (error: any) {
      // Check for quota or other retryable errors to decide on fallback
      const isQuotaError = error.status === 429 || error.code === 'insufficient_quota';
      
      console.warn(`[AI INFO] OpenAI attempt failed (Quota: ${isQuotaError}). Trying Gemini fallback...`);
      
      try {
        const result = await interpretWithGemini(text, contactName, menuItems);
        return res.json({ ...result, _ai: "gemini-fallback" });
      } catch (geminiError) {
        console.error("[AI ERROR] Gemini Fallback also failed:", geminiError);
        return res.status(500).json({ error: "Todas as IAs falharam em interpretar o pedido" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
