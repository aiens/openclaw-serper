/**
 * Serper Scholar Plugin for OpenClaw
 * Google Scholar API integration — academic paper search only.
 *
 * API key resolution order:
 *   1. openclaw.json  →  tools.web.search.serper.apiKey   (desktop config panel, no restart needed)
 *   2. process.env.SERPER_API_KEY                          (legacy .env fallback)
 */

import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function json(data: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data,
  };
}

function resolveApiKey(): string | undefined {
  try {
    const cfgPath = join(homedir(), ".openclaw", "openclaw.json");
    const cfg = JSON.parse(readFileSync(cfgPath, "utf-8"));
    const key = cfg?.tools?.web?.search?.serper?.apiKey;
    if (typeof key === "string" && key.trim()) return key.trim();
  } catch {
    // config file missing or malformed — fall through
  }
  return process.env.SERPER_API_KEY || undefined;
}

async function serperScholar(params: {
  query: string;
  num?: number;
  gl?: string;
  hl?: string;
}) {
  const { query, num = 10, gl = "cn", hl = "zh-CN" } = params;

  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error(
      "Serper API Key 未配置。请在桌面端「工具 → Web 搜索」中选择 Serper 供应商并填写 API Key，或设置环境变量 SERPER_API_KEY。"
    );
  }

  const body = JSON.stringify({
    q: query,
    num: Math.min(num, 20),
    gl,
    hl,
  });

  const resp = await fetch("https://google.serper.dev/scholar", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body,
  });

  const result = await resp.json();

  if (!resp.ok) {
    throw new Error(
      `Serper Scholar API Error: ${resp.status} - ${result?.message || JSON.stringify(result)}`
    );
  }

  const formatted: {
    query: string;
    results: Array<Record<string, unknown>>;
    count: number;
  } = { query, results: [], count: 0 };

  if (result.organic) {
    formatted.results = result.organic.map((item: Record<string, unknown>) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      type: item.type,
      year: item.year,
      authors: Array.isArray(item.authors)
        ? (item.authors as string[]).join(", ")
        : item.authors,
      publication: item.publication,
      citationCount: item.citationCount,
    }));
    formatted.count = formatted.results.length;
  }

  return formatted;
}

const serperPlugin = {
  id: "serper",
  name: "Serper Scholar",
  description:
    "Google Scholar search plugin for OpenClaw — academic papers, citations & publications.",
  kind: "extension" as const,
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    api.registerTool(
      {
        name: "serper_scholar",
        label: "Serper Scholar Search",
        description:
          "Search academic papers via Google Scholar API. Returns title, authors, year, citation count, publication venue and snippets.",
        parameters: Type.Object({
          query: Type.String({ description: "Search query for academic papers" }),
          num: Type.Optional(
            Type.Number({ description: "Number of results (max 20, default 10)" })
          ),
          gl: Type.Optional(
            Type.String({ description: "Country code (default: cn)" })
          ),
          hl: Type.Optional(
            Type.String({ description: "Language code (default: zh-CN)" })
          ),
        }),
        async execute(_toolCallId, params) {
          try {
            const result = await serperScholar(
              params as { query: string; num?: number; gl?: string; hl?: string }
            );
            return json(result);
          } catch (err) {
            return json({
              error: err instanceof Error ? err.message : String(err),
            });
          }
        },
      },
      { name: "serper_scholar" }
    );
  },
};

export default serperPlugin;
