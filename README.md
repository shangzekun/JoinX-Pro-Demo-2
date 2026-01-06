# JoinX Pro —— 连接工艺智能开发平台（前端 Demo）

本仓库提供一个完整可运行的前端 SaaS Demo，用于演示 JoinX Pro 在汽车车身连接工艺（如 SPR、点焊、铆接）中的多智能体工程决策流程。所有逻辑均为前端 Mock，重点展示流程透明度、人工确认与可追溯性。

## Demo 能力
- **Agent 能力库**：内置参数推荐、参数空间探索、工艺窗口生成、失效模式预测、工艺鲁棒性评估等智能体，支持拖拽到画布。
- **Agentic Workflow 画布**：基于 React Flow，实现开始/结束节点、智能体节点、人工确认节点，支持串行连接与条件分支（通过/驳回）。
- **Mock 执行引擎**：前端遍历流程，异步模拟执行，输出中文结果并记录日志。
- **人工确认（Human-in-the-loop）**：流程在人工节点暂停，由工程师在右侧面板批准或驳回后继续。
- **决策路径终端**：底部终端式日志实时展示执行轨迹、参数输出与暂停点，体现工程可追溯性。
- **结果追溯面板**：右侧收集每个节点的输出摘要与耗时，呈现最终建议、窗口与风险评估。

## Agentic Workflow 的工程意义
- 将“工艺智能体”视为最小能力单元，可按阶段自由组合。
- Workflow 是可执行的工程决策过程，包含数据、判断与责任节点。
- 人工确认节点强制工程师参与关键决策，避免“黑盒自动化”。
- 决策路径与日志可回溯，可作为质量审计与经验资产沉淀。

## 本地运行
```bash
npm install          # 安装项目依赖，会把 next/React Flow 安装到本地 node_modules/.bin
npm run dev          # 调用 package.json 内置脚本，自动使用本地 next 可执行文件
```
访问 `http://localhost:3000` 查看 Demo。

### 环境与依赖提示
- 推荐使用 Node.js 18+；首次运行必须完成 `npm install`，否则 `npm run dev` 会因为缺少本地 next 可执行文件而提示 “'next' 不是内部或外部命令”。
- 如果在公司代理/安全策略下遇到 403（常见于 `@types/*` 或作用域包）：
  - 检查并必要时暂时清空代理配置：`npm config delete http-proxy && npm config delete https-proxy`；
  - 临时切换镜像源：`npm install --registry=https://registry.npmmirror.com`；
  - 在离线环境使用私有镜像仓库，并将 `.npmrc` 的 registry 指向可访问地址。

### 常见问题排查（“next 不是内部或外部命令”）
1. 确认已经执行过 `npm install`，并且过程中无 403/ENOTFOUND 报错。
2. 若曾在全局安装 `next`，请删除全局缓存并重试（确保使用项目内版本）：
   ```bash
   npm uninstall -g next || true
   npm cache verify
   npm install
   npm run dev
   ```
3. Windows 环境如果启用了杀毒/管控软件拦截 npm 写入 `node_modules/.bin`，请在信任名单中放行或使用 WSL/容器环境。

## 对接真实后端的思路
- 将 `lib/mockEngine.ts` 的执行逻辑替换为后端调度：接入队列、作业 ID 与实时状态轮询。
- Agent 输入/输出 schema 可与后端 gRPC/REST 契约对齐，并在前端显示字段级校验。
- 人工确认节点可与权限、签名流程结合，记录确认人、原因与备注。
- 日志与输出结果可持久化到追溯数据库，支持版本化与审计。

## 目录结构
```
/app
  layout.tsx
  page.tsx
  /components
    AgentLibrary.tsx
    WorkflowCanvas.tsx
    NodeInspector.tsx
    DecisionTerminal.tsx
    ResultPanel.tsx
    RunPanel.tsx
/lib
  agents.ts
  mockEngine.ts
  types.ts
  workflowUtils.ts
README.md
```

## 免责声明
- 本 Demo 无任何真实算法与工艺计算，仅用于展示产品形态与交互。
- 所有数据与结果为 Mock，不可直接用于生产决策。
