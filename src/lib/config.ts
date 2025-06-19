import fs from 'fs/promises';
import path from 'path';

interface AppConfig {
  appName: string;
  apiEndpoint: string;
  defaultBotMessage: string;
  features: Record<string, any>;
}

let currentConfig: AppConfig | null = null;
const CONFIG_PATH = path.join(process.cwd(), 'app.config.json');

async function loadConfigFromFile(): Promise<AppConfig> {
  try {
    const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(fileContent) as AppConfig;
    if (!config.apiEndpoint) {
        console.warn("API endpoint is not defined in config. Using default.");
        config.apiEndpoint = "https://jsonplaceholder.typicode.com/posts"; // Default fallback
    }
    return config;
  } catch (error) {
    console.error('Failed to load configuration file:', error);
    // Return a default/fallback config if loading fails
    return {
      appName: "Genie (Default)",
      apiEndpoint: "https://jsonplaceholder.typicode.com/posts",
      defaultBotMessage: "Welcome to Genie! Configuration could not be loaded.",
      features: {}
    };
  }
}

export async function getConfig(): Promise<AppConfig> {
  if (process.env.NODE_ENV === 'development' || !currentConfig) {
    // In development, always reload. In production, load once unless reloaded.
    currentConfig = await loadConfigFromFile();
  }
  return currentConfig!; // currentConfig will be initialized by loadConfigFromFile
}

export async function reloadAppConfig(): Promise<AppConfig> {
  console.log("Attempting to reload application configuration...");
  currentConfig = await loadConfigFromFile();
  console.log("Application configuration reloaded successfully.");
  return currentConfig;
}
