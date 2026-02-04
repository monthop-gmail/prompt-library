# N8N Workflow Integration Guide

## 🔄 Automated Prompt Processing with N8N

### Overview
เชื่อมต่อ AI Work Library กับ N8N เพื่อ automate การ process prompts

---

## Workflow 1: GitHub → AI Processing → Output

### Trigger
- **GitHub Webhook** - เมื่อมี commit ใหม่ใน `prompts/ideas/`

### Steps

#### 1. Detect New Prompt
```javascript
// N8N Code Node
const files = $input.all()[0].json.commits[0].added;
const promptFiles = files.filter(f => f.startsWith('prompts/ideas/') && f.endsWith('.md'));

return promptFiles.map(file => ({
  json: {
    file: file,
    timestamp: new Date().toISOString()
  }
}));
```

#### 2. Fetch Prompt Content
- **HTTP Request Node**
- Method: GET
- URL: `https://raw.githubusercontent.com/{{username}}/{{repo}}/main/{{$json.file}}`

#### 3. Extract Metadata
```javascript
// Parse prompt front matter
const content = $input.first().json.data;
const lines = content.split('\n');

let title = '';
let category = '';
let status = '';

for (const line of lines) {
  if (line.startsWith('# ')) title = line.substring(2);
  if (line.includes('**Category:**')) category = line.split('**Category:**')[1].trim();
  if (line.includes('**Status:**')) status = line.split('**Status:**')[1].trim();
}

return {
  json: {
    title,
    category,
    status,
    content,
    file: $('Detect New Prompt').item.json.file
  }
};
```

#### 4. Route by Mode
- **Switch Node** based on category/tags
- Routes:
  - POC
  - MVP  
  - Test
  - Docs

#### 5. AI Processing (Claude API)
```javascript
// N8N HTTP Request for Claude API
{
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "authentication": "headerAuth",
  "headers": {
    "x-api-key": "{{$credentials.claudeApi}}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4000,
    "messages": [
      {
        "role": "user",
        "content": `Based on this prompt, generate a {{$json.mode}} implementation:\n\n{{$json.content}}`
      }
    ]
  }
}
```

#### 6. Format Output
```javascript
// Structure the AI response
const aiResponse = $input.first().json.content[0].text;
const mode = $('Route by Mode').item.json.mode;
const promptName = $('Extract Metadata').item.json.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-');

return {
  json: {
    projectName: promptName,
    mode: mode,
    content: aiResponse,
    timestamp: new Date().toISOString(),
    path: `projects/${promptName}/${mode}/`
  }
};
```

#### 7. Create GitHub PR
- **GitHub Node - Create File**
- Repository: `ai-work-library`
- File Path: `{{$json.path}}README.md`
- Content: `{{$json.content}}`
- Branch: `auto-generate-{{$json.projectName}}-{{$json.mode}}`
- Create PR: Yes

#### 8. Notify
- **Slack/Discord/Email Node**
- Message: "✅ Generated {{mode}} for {{projectName}}"

---

## Workflow 2: Schedule Auto-Upgrade

### Trigger
- **Cron** - Weekly/Monthly

### Steps

#### 1. List All Prompts
```javascript
// Get all completed prompts
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: $credentials.github.token });

const { data } = await octokit.repos.getContent({
  owner: 'your-username',
  repo: 'ai-work-library',
  path: 'prompts/completed'
});

return data
  .filter(f => f.name.endsWith('.md'))
  .map(f => ({
    json: {
      name: f.name,
      path: f.path,
      sha: f.sha
    }
  }));
```

#### 2. Check Last Update
```javascript
// Compare with project version
const promptFile = $json.path;
const projectExists = // check if projects/{name} exists

if (!projectExists) {
  return { json: { needsUpdate: true, reason: 'new' }};
}

// Check if prompt modified since project creation
const promptModified = // get last modified date
const projectCreated = // get project creation date

return {
  json: {
    needsUpdate: promptModified > projectCreated,
    reason: 'updated'
  }
};
```

#### 3. AI Re-evaluation
```javascript
// Ask Claude if improvements are possible
const prompt = `
Review this completed prompt and determine if newer AI capabilities 
could improve the implementation:

${$json.content}

Current implementation exists. Would you:
1. Keep as-is (still optimal)
2. Suggest improvements (better approach exists)
3. Complete rewrite (significantly better way)

Respond in JSON format.
`;
```

#### 4. Execute Improvements
- Only if Claude suggests improvements
- Create new branch: `upgrade-{prompt-name}-{version}`
- Generate improved version
- Create PR with comparison

---

## Workflow 3: Fork Integration Monitor

### Trigger
- **GitHub Webhook** - PR created

### Steps

#### 1. Analyze PR Changes
```javascript
// Check what was improved
const files = $json.pull_request.changed_files;
const improvements = [];

for (const file of files) {
  if (file.patch) {
    // Analyze changes
    improvements.push({
      file: file.filename,
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions
    });
  }
}

return { json: { improvements }};
```

#### 2. AI Quality Check
```javascript
// Ask Claude to review PR
const prompt = `
Review this PR for the AI Work Library:

Changes:
${JSON.stringify($json.improvements, null, 2)}

Evaluate:
1. Code quality
2. Prompt improvement
3. Documentation
4. Breaking changes

Approve/Request Changes/Reject with reasoning.
`;
```

#### 3. Auto-merge or Flag
- If AI approves + tests pass → Auto-merge
- If concerns → Add review comments
- Update statistics

---

## Setup Instructions

### 1. Install N8N
```bash
npm install -g n8n
# or
npx n8n
```

### 2. Import Workflows
1. Copy workflow JSON files from `workflows/n8n/`
2. Import in N8N UI
3. Configure credentials:
   - GitHub Token
   - Claude API Key
   - Slack/Discord (optional)

### 3. Configure Webhooks
```bash
# GitHub webhook URL
https://your-n8n.com/webhook/ai-library-prompt

# Events to monitor:
- push (for new prompts)
- pull_request (for contributions)
```

### 4. Test
```bash
# Add a test prompt
./scripts/add-idea.sh "Test automation" automation

# Commit and push
git add .
git commit -m "Test: automation trigger"
git push

# Check N8N execution log
```

---

## Advanced: Custom AI Processing

### Multi-Model Strategy
```javascript
// Use different models for different tasks
const modelMap = {
  'poc': 'claude-haiku-4-20250101',      // Fast, cheap
  'mvp': 'claude-sonnet-4-20250514',     // Balanced
  'test': 'claude-sonnet-4-20250514',    // Thorough
  'docs': 'claude-opus-4-5-20251101'     // Best quality
};

const model = modelMap[$json.mode] || 'claude-sonnet-4-20250514';
```

### Iterative Refinement
```javascript
// Multi-pass processing
let output = initialGeneration;

for (let i = 0; i < 2; i++) {
  output = await claudeAPI({
    messages: [
      { role: 'user', content: output },
      { role: 'user', content: 'Review and improve this code. Focus on: performance, readability, best practices.' }
    ]
  });
}

return { json: { refined: output }};
```

### Cost Tracking
```javascript
// Track AI credit usage
const cost = {
  'haiku': 0.25,  // per 1M tokens
  'sonnet': 3.00,
  'opus': 15.00
};

const tokensUsed = $json.usage.total_tokens;
const modelCost = cost[$json.model.split('-')[1]];
const totalCost = (tokensUsed / 1000000) * modelCost;

// Save to database/spreadsheet
return {
  json: {
    date: new Date(),
    project: $json.projectName,
    mode: $json.mode,
    tokens: tokensUsed,
    cost: totalCost
  }
};
```

---

## Monitoring Dashboard

### Metrics to Track
- ✅ Prompts processed / day
- 💰 AI credits used
- 📈 Library growth rate
- ⭐ Success rate (merged PRs)
- 🔄 Re-generation frequency
- 💎 Most valuable prompts

### Create Dashboard
```javascript
// N8N → Google Sheets/Airtable
{
  spreadsheetId: 'your-sheet-id',
  range: 'Dashboard!A:F',
  values: [[
    new Date().toISOString(),
    $json.totalPrompts,
    $json.creditsUsed,
    $json.successRate,
    $json.activeForks
  ]]
}
```

---

## Tips for Maximum Value

### 1. **Batch Processing**
- Process multiple prompts together
- Use cheaper models for initial passes
- Reserve Opus for final polish

### 2. **Smart Caching**
- Cache common patterns
- Reuse successful structures
- Template successful outputs

### 3. **Progressive Enhancement**
```
Week 1: POC only (validate ideas fast)
Week 2: MVP for winners (build what works)
Week 3: Full test suite (quality assurance)
Week 4: Documentation (share knowledge)
```

### 4. **ROI Optimization**
```javascript
// Calculate value per credit
const value = {
  timesSaved: hoursNotCoding * hourlyRate,
  bugsAvoided: testsGenerated * bugCost,
  knowledgeRetained: promptsCreated * retentionValue
};

const roi = value.total / creditsSpent;
// Aim for ROI > 10x
```

---

## Troubleshooting

### Issue: Workflow not triggering
```bash
# Check webhook
curl -X POST https://your-n8n.com/webhook-test/ai-library \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Issue: AI generation fails
```javascript
// Add retry logic
const maxRetries = 3;
let attempt = 0;
let result = null;

while (attempt < maxRetries && !result) {
  try {
    result = await claudeAPI(prompt);
  } catch (error) {
    attempt++;
    await sleep(1000 * attempt); // Exponential backoff
  }
}
```

### Issue: High costs
```javascript
// Add budget limits
const MONTHLY_BUDGET = 50; // USD
const currentSpend = getCurrentMonthSpend();

if (currentSpend + estimatedCost > MONTHLY_BUDGET) {
  return { 
    json: { 
      status: 'skipped', 
      reason: 'budget_exceeded' 
    }
  };
}
```

---

## Next Steps

1. ✅ Setup basic workflow (Prompt → POC)
2. ✅ Add auto-upgrade scheduler
3. ✅ Configure PR monitoring
4. ✅ Create cost tracking
5. ✅ Build dashboard
6. 🚀 Iterate and improve!
