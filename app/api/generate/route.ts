import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// System Prompt：严格限制模型只输出可被 react-live 直接渲染的纯 JSX 节点
const SYSTEM_PROMPT = `你是一个资深前端工程师。请根据用户需求，生成一段可以直接被 react-live 动态渲染的 React JSX 代码。必须使用 Tailwind CSS 进行样式排版。
严格限制（如果违反将导致系统崩溃）：

只能输出纯粹的 JSX 节点代码（以 < 开头，以 > 结尾）。

绝不允许包含任何 import 语句。

绝不允许包含 export default 或组件声明。

绝不允许输出 markdown 代码块标记（如 \`\`\`jsx 或 \`\`\`）。

绝不允许输出任何解释性文本。`;

// 懒加载单例客户端，避免每次请求重复实例化
let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!client) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error("环境变量 LLM_API_KEY 未配置");
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
    console.log("[generate] OpenAI 客户端初始化完成，baseURL: https://api.deepseek.com");
  }
  return client;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string | undefined = body?.prompt;
    // 可选：当前正在展示的代码，有值时切换为「基于旧代码修改」模式
    const currentCode: string | undefined = body?.currentCode;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      console.warn("[generate] 请求缺少有效的 prompt 字段");
      return NextResponse.json(
        { error: "请求体必须包含非空的 prompt 字段" },
        { status: 400 }
      );
    }

    const isModifyMode = !!(currentCode && currentCode.trim());
    console.log(`[generate] 模式: ${isModifyMode ? "迭代修改" : "全新生成"}`);
    console.log(`[generate] prompt 长度: ${prompt.length} 字符`);
    if (isModifyMode) {
      console.log(`[generate] currentCode 长度: ${currentCode!.length} 字符`);
    }

    // 构建发送给大模型的用户消息
    // 修改模式：将旧代码 + 新需求一起打包，让模型理解「在此基础上调整」的语义
    const userMessage = isModifyMode
      ? `当前已有的组件 JSX 代码如下（请在此基础上进行修改，不要从头重写）：

\`\`\`jsx
${currentCode}
\`\`\`

用户的修改需求：${prompt}`
      : prompt;

    const openai = getClient();

    console.log("[generate] 开始调用 deepseek-chat 模型……");
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const rawCode = completion.choices?.[0]?.message?.content ?? "";
    const code = rawCode.trim();

    if (!code) {
      console.error("[generate] 模型返回了空内容", completion);
      return NextResponse.json(
        { error: "模型返回内容为空，请重试" },
        { status: 502 }
      );
    }

    console.log(`[generate] 生成成功，代码长度: ${code.length} 字符`);
    console.log(`[generate] 代码预览: ${code.slice(0, 120)}${code.length > 120 ? "…" : ""}`);

    return NextResponse.json({ code });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`[generate] 接口异常: ${err.message}`, err.stack);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("[generate] 未知异常:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
