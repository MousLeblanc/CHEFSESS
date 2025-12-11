// services/aiService.js
// Service d'abstraction pour supporter plusieurs providers d'IA
import openai from './openaiClient.js';
import dotenv from 'dotenv';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic'; // openai, anthropic, gemini, mistral, ollama

/**
 * Service unifié pour appeler différentes IA
 * Supporte: OpenAI, Anthropic Claude, Google Gemini, Mistral, Ollama
 */
export class AIService {
  constructor() {
    this.provider = AI_PROVIDER;
    this.client = null;
    this.initialized = false;
    this.initPromise = this.initializeProvider();
  }

  async initializeProvider() {
    if (this.initialized) return;
    
    switch (this.provider) {
      case 'anthropic':
        try {
          // Vérifier que la clé API est définie
          if (!process.env.ANTHROPIC_API_KEY) {
            console.warn('⚠️ ANTHROPIC_API_KEY non définie. Basculement vers OpenAI.');
            this.fallbackToOpenAI();
            return;
          }
          
          const Anthropic = (await import('@anthropic-ai/sdk')).default;
          this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
          
          // Tester la connexion avec une requête simple
          try {
            await this.client.messages.create({
              model: 'claude-3-haiku-20240307',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'test' }]
            });
            this.initialized = true;
            console.log('✅ Anthropic Claude initialisé et testé');
          } catch (testError) {
            console.error('❌ Erreur lors du test de connexion Anthropic:', testError.message);
            console.warn('⚠️ Basculement vers OpenAI.');
            this.fallbackToOpenAI();
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'initialisation Anthropic:', error.message);
          console.warn('⚠️ Anthropic SDK non disponible. Basculement vers OpenAI.');
          this.fallbackToOpenAI();
        }
        break;

      case 'gemini':
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
          this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
          this.initialized = true;
          console.log('✅ Google Gemini initialisé');
        } catch (error) {
          console.warn('⚠️ Google AI SDK non installé. Installez avec: npm install @google/generative-ai');
          this.fallbackToOpenAI();
        }
        break;

      case 'mistral':
        try {
          const MistralClient = (await import('@mistralai/mistralai')).default;
          this.client = new MistralClient({
            apiKey: process.env.MISTRAL_API_KEY,
          });
          this.initialized = true;
          console.log('✅ Mistral AI initialisé');
        } catch (error) {
          console.warn('⚠️ Mistral SDK non installé. Installez avec: npm install @mistralai/mistralai');
          this.fallbackToOpenAI();
        }
        break;

      case 'ollama':
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.modelName = process.env.OLLAMA_MODEL || 'llama3.1:70b';
        this.initialized = true;
        console.log(`✅ Ollama configuré (${this.ollamaUrl})`);
        break;

      case 'openai':
      default:
        this.client = openai;
        this.openaiClient = openai;
        this.initialized = true;
        console.log('✅ OpenAI initialisé');
        break;
    }
  }

  fallbackToOpenAI() {
    console.log('🔄 Basculement vers OpenAI par défaut');
    this.provider = 'openai';
    this.client = openai;
    this.openaiClient = openai;
    this.initialized = true;
  }

  /**
   * Appel unifié vers l'IA
   * @param {Array} messages - Messages au format [{role: 'user', content: '...'}]
   * @param {Object} options - Options: {model, temperature, max_tokens, response_format}
   */
  async generate(messages, options = {}) {
    // Attendre que le provider soit initialisé
    await this.initPromise;
    
    // Vérifier que le service est initialisé
    if (!this.initialized) {
      throw new Error('Service IA non initialisé. Vérifiez que OPENAI_API_KEY ou ANTHROPIC_API_KEY est configurée.');
    }
    
    const {
      model = null,
      temperature = 0.7,
      max_tokens = 4000,
      response_format = null
    } = options;

    try {
      switch (this.provider) {
        case 'anthropic':
          return await this.generateAnthropic(messages, { model, temperature, max_tokens });

        case 'gemini':
          return await this.generateGemini(messages, { model, temperature, max_tokens });

        case 'mistral':
          return await this.generateMistral(messages, { model, temperature, max_tokens, response_format });

        case 'ollama':
          return await this.generateOllama(messages, { model, temperature, max_tokens });

        case 'openai':
        default:
          return await this.generateOpenAI(messages, { model, temperature, max_tokens, response_format });
      }
    } catch (error) {
      console.error(`❌ Erreur avec ${this.provider}:`, error.message);
      
      // Fallback automatique vers OpenAI si erreur
      if (this.provider !== 'openai') {
        console.log('🔄 Tentative de fallback vers OpenAI...');
        return await this.generateOpenAI(messages, { model, temperature, max_tokens, response_format });
      }
      
      throw error;
    }
  }

  async generateOpenAI(messages, options) {
    const { model = 'gpt-4o', temperature, max_tokens, response_format } = options;
    
    // Utiliser le client OpenAI (peut être this.client ou this.openaiClient)
    const openaiClient = this.openaiClient || this.client || openai;
    
    const completion = await openaiClient.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      ...(response_format && { response_format })
    });

    return {
      content: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model
    };
  }

  async generateAnthropic(messages, options) {
    // Modèles Claude disponibles: claude-3-5-sonnet-20240620, claude-3-opus-20240229, claude-3-haiku-20240307
    // Utiliser claude-3-haiku-20240307 par défaut (généralement disponible pour tous les comptes)
    const { model = 'claude-3-haiku-20240307', temperature, max_tokens } = options;
    
    // Convertir les messages (Anthropic n'a pas de role 'system' séparé)
    const anthropicMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return { role: 'user', content: `[SYSTEM] ${msg.content}` };
      }
      // Anthropic accepte 'user' et 'assistant'
      if (msg.role === 'assistant' || msg.role === 'user') {
        return { role: msg.role, content: msg.content };
      }
      // Par défaut, traiter comme 'user'
      return { role: 'user', content: msg.content };
    });

    // Vérifier que le client est initialisé
    if (!this.client) {
      throw new Error('Client Anthropic non initialisé');
    }

    const message = await this.client.messages.create({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: max_tokens || 4000,
      temperature: temperature || 0.7,
      messages: anthropicMessages
    });

    return {
      content: message.content[0].text,
      usage: {
        prompt_tokens: message.usage.input_tokens,
        completion_tokens: message.usage.output_tokens,
        total_tokens: message.usage.input_tokens + message.usage.output_tokens
      },
      model: message.model
    };
  }

  async generateGemini(messages, options) {
    const { model = this.modelName || 'gemini-1.5-pro', temperature, max_tokens } = options;
    
    const geminiModel = this.client.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens
      }
    });

    // Combiner les messages pour Gemini
    const prompt = messages
      .map(msg => `${msg.role === 'system' ? '[SYSTEM]' : msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    return {
      content: response,
      usage: {
        prompt_tokens: 0, // Gemini ne retourne pas toujours les tokens
        completion_tokens: 0,
        total_tokens: 0
      },
      model
    };
  }

  async generateMistral(messages, options) {
    const { model = 'mistral-large-latest', temperature, max_tokens, response_format } = options;
    
    const chatResponse = await this.client.chat.complete({
      model,
      messages: messages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.content
      })),
      temperature,
      maxTokens: max_tokens,
      ...(response_format && { responseFormat: response_format })
    });

    return {
      content: chatResponse.choices[0].message.content,
      usage: {
        prompt_tokens: chatResponse.usage?.promptTokens || 0,
        completion_tokens: chatResponse.usage?.completionTokens || 0,
        total_tokens: (chatResponse.usage?.promptTokens || 0) + (chatResponse.usage?.completionTokens || 0)
      },
      model: chatResponse.model
    };
  }

  async generateOllama(messages, options) {
    const { model = this.modelName || 'llama3.1:70b', temperature, max_tokens } = options;
    
    // Combiner les messages pour Ollama
    const prompt = messages
      .map(msg => {
        const role = msg.role === 'system' ? 'System' : msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: max_tokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.response,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      },
      model
    };
  }

  /**
   * Parse le JSON de la réponse (avec fallback si nécessaire)
   */
  parseJSON(content) {
    try {
      // Essayer de parser directement
      return JSON.parse(content);
    } catch (error) {
      // Essayer d'extraire le JSON du texte
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Impossible de parser le JSON de la réponse');
    }
  }
}

// Instance singleton
const aiService = new AIService();

export default aiService;
