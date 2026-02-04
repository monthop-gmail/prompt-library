#!/bin/bash

# AI Work Library Setup Script
# สร้างโครงสร้างพื้นฐานสำหรับ AI Work Library

set -e

REPO_NAME="ai-work-library"
GITHUB_USER=${1:-"your-github-username"}

echo "🚀 Setting up AI Work Library..."

# Create directory structure
mkdir -p $REPO_NAME/{prompts/{ideas,completed,templates},projects,workflows,.github/workflows}

# Navigate to repo
cd $REPO_NAME

# Initialize git
git init
echo "✓ Git initialized"

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.env

# Node
node_modules/
.npm/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temp files
*.tmp
*.log
temp/
EOF

# Create README.md
cat > README.md << 'EOF'
# 🤖 AI Work Library

> Automated system for capturing, converting, and evolving AI-assisted work

## 📊 Statistics
- **Total Prompts**: 0
- **Completed Projects**: 0
- **Success Rate**: 0%

## 🎯 Quick Start

### 1. Add New Idea
```bash
./scripts/add-idea.sh "My automation idea" automation
```

### 2. Convert Existing Code
```bash
./scripts/convert-code.sh path/to/code.py
```

### 3. Generate Project
```bash
./scripts/generate.sh prompt-name poc
# Modes: poc, mvp, test, docs
```

### 4. Fork & Contribute
```bash
git checkout -b improve/prompt-name
# Make improvements
git commit -m "Improved: [description]"
git push origin improve/prompt-name
# Create PR
```

## 📁 Structure

```
prompts/
├── ideas/       # ไอเดียที่รอทำ
├── completed/   # ที่ทำเสร็จแล้ว
└── templates/   # Template prompts

projects/
└── {name}/      # Generated projects
    ├── prompt.md
    ├── poc/
    ├── mvp/
    ├── tests/
    └── docs/
```

## 🔄 Workflow

1. **Capture** - บันทึกไอเดีย/โค้ดเก่า
2. **Convert** - AI แปลงเป็น Markdown prompt
3. **Generate** - สร้าง POC/MVP/Test/Docs
4. **Evolve** - Fork, improve, PR กลับ

## 📈 Benefits

- ✅ ไม่เสีย AI credits
- ✅ สะสมความรู้
- ✅ ไม่ทำซ้ำ
- ✅ ต่อยอดได้เรื่อยๆ
- ✅ AI เก่งขึ้น = Library เก่งขึ้น

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License
EOF

# Create template prompts
cat > prompts/templates/poc-template.md << 'EOF'
# POC: {TITLE}

## 🎯 Objective
Quick proof of concept to validate the idea

## 📋 Requirements
- Must run in < 5 minutes
- Minimal dependencies
- Core functionality only
- Basic error handling

## 🔧 Technical Approach
{APPROACH}

## ✅ Success Criteria
- [ ] Core function works
- [ ] Basic input/output validated
- [ ] Can demonstrate to stakeholders

## 📦 Deliverables
- Single file implementation
- Basic README
- Example usage

---
**Prompt Context:**
```
{ORIGINAL_PROMPT}
```
EOF

cat > prompts/templates/mvp-template.md << 'EOF'
# MVP: {TITLE}

## 🎯 Objective
Minimum viable product for real-world use

## 📋 Requirements
- Production-ready code
- Proper error handling
- Configuration support
- Basic testing
- Documentation

## 🔧 Technical Approach
{APPROACH}

## ✅ Success Criteria
- [ ] Handles edge cases
- [ ] Configurable
- [ ] Tested on sample data
- [ ] Documented
- [ ] Ready to deploy

## 📦 Deliverables
- Clean code structure
- Configuration files
- Basic tests
- User documentation
- Deployment guide

---
**Prompt Context:**
```
{ORIGINAL_PROMPT}
```
EOF

cat > prompts/templates/test-template.md << 'EOF'
# TEST: {TITLE}

## 🎯 Objective
Comprehensive testing suite

## 📋 Requirements
- Unit tests
- Integration tests
- Edge case coverage
- Performance tests
- Test documentation

## 🔧 Testing Strategy
{STRATEGY}

## ✅ Success Criteria
- [ ] >80% code coverage
- [ ] All edge cases covered
- [ ] Performance benchmarks met
- [ ] CI/CD ready

## 📦 Deliverables
- Test suite
- Coverage report
- Performance benchmarks
- Testing documentation

---
**Prompt Context:**
```
{ORIGINAL_PROMPT}
```
EOF

cat > prompts/templates/docs-template.md << 'EOF'
# DOCS: {TITLE}

## 🎯 Objective
Complete documentation

## 📋 Requirements
- API documentation
- User guide
- Examples
- Troubleshooting
- Architecture diagrams

## 🔧 Documentation Approach
{APPROACH}

## ✅ Success Criteria
- [ ] Complete API reference
- [ ] Step-by-step tutorials
- [ ] Common use cases
- [ ] FAQs
- [ ] Diagrams

## 📦 Deliverables
- API docs
- User guide
- Examples
- Troubleshooting guide
- Architecture documentation

---
**Prompt Context:**
```
{ORIGINAL_PROMPT}
```
EOF

# Create automation scripts directory
mkdir -p scripts

# Create add-idea script
cat > scripts/add-idea.sh << 'EOF'
#!/bin/bash

TITLE=$1
CATEGORY=${2:-"general"}

if [ -z "$TITLE" ]; then
    echo "Usage: ./add-idea.sh \"Title\" [category]"
    exit 1
fi

SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
FILE="prompts/ideas/$CATEGORY/$SLUG.md"

mkdir -p "prompts/ideas/$CATEGORY"

cat > "$FILE" << IDEAEOF
# $TITLE

**Category:** $CATEGORY  
**Created:** $(date +%Y-%m-%d)  
**Status:** 💡 Idea

## Description
<!-- Describe what you want to build -->

## Why?
<!-- Why is this useful? -->

## Requirements
- 
- 

## Ideas
- 
- 

## Resources
- 

---
**Next Steps:**
1. Refine requirements
2. Convert to project prompt
3. Generate POC
IDEAEOF

echo "✓ Created idea: $FILE"
EOF

chmod +x scripts/add-idea.sh

# Create convert-code script
cat > scripts/convert-code.sh << 'EOF'
#!/bin/bash

CODE_FILE=$1

if [ -z "$CODE_FILE" ]; then
    echo "Usage: ./convert-code.sh path/to/code.py"
    exit 1
fi

if [ ! -f "$CODE_FILE" ]; then
    echo "Error: File not found: $CODE_FILE"
    exit 1
fi

BASENAME=$(basename "$CODE_FILE" | sed 's/\.[^.]*$//')
OUTPUT="prompts/completed/$BASENAME.md"

mkdir -p "prompts/completed"

cat > "$OUTPUT" << CODEEOF
# Converted: $BASENAME

**Source:** $CODE_FILE  
**Converted:** $(date +%Y-%m-%d)  
**Status:** ✅ Completed

## Original Code

\`\`\`$(echo "$CODE_FILE" | sed 's/.*\.//')
$(cat "$CODE_FILE")
\`\`\`

## Functionality
<!-- AI: Analyze and describe what this code does -->

## Use Cases
<!-- AI: List potential use cases -->

## Improvements
<!-- AI: Suggest improvements -->

## Prompt Template

\`\`\`
Create a {type} that:
- [Extract key features from code]
- [List main functionality]
- [Note any special requirements]

Technical requirements:
- [Language/framework used]
- [Dependencies]
- [Performance needs]
\`\`\`

---
**Next Steps:**
1. Review and refine prompt
2. Generate improved version
3. Add tests
CODEEOF

echo "✓ Converted code to prompt: $OUTPUT"
echo "→ Review and edit: $OUTPUT"
EOF

chmod +x scripts/convert-code.sh

# Create generate script
cat > scripts/generate.sh << 'EOF'
#!/bin/bash

PROMPT_NAME=$1
MODE=${2:-"poc"}

if [ -z "$PROMPT_NAME" ]; then
    echo "Usage: ./generate.sh prompt-name [poc|mvp|test|docs]"
    exit 1
fi

# Find prompt file
PROMPT_FILE=$(find prompts -name "$PROMPT_NAME.md" | head -1)

if [ -z "$PROMPT_FILE" ]; then
    echo "Error: Prompt not found: $PROMPT_NAME"
    exit 1
fi

PROJECT_DIR="projects/$PROMPT_NAME"
mkdir -p "$PROJECT_DIR/$MODE"

echo "🤖 Generating $MODE for $PROMPT_NAME..."
echo "📁 Output: $PROJECT_DIR/$MODE"
echo ""
echo "Next: Use Claude/AI to process this prompt with mode: $MODE"
echo "Prompt file: $PROMPT_FILE"
EOF

chmod +x scripts/generate.sh

# Create GitHub Actions workflow
cat > .github/workflows/update-stats.yml << 'EOF'
name: Update Statistics

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Count prompts
        run: |
          TOTAL=$(find prompts -name "*.md" | wc -l)
          COMPLETED=$(find prompts/completed -name "*.md" | wc -l)
          PROJECTS=$(find projects -maxdepth 1 -type d | wc -l)
          
          echo "Total Prompts: $TOTAL"
          echo "Completed: $COMPLETED"
          echo "Projects: $PROJECTS"
          
          # Update README (basic version)
          sed -i "s/\*\*Total Prompts\*\*: .*/\*\*Total Prompts\*\*: $TOTAL/" README.md
          sed -i "s/\*\*Completed Projects\*\*: .*/\*\*Completed Projects\*\*: $COMPLETED/" README.md
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add README.md
          git diff --quiet && git diff --staged --quiet || git commit -m "📊 Update statistics"
          git push
EOF

echo ""
echo "✅ AI Work Library created successfully!"
echo ""
echo "📁 Repository structure created in: $REPO_NAME/"
echo ""
echo "🚀 Next steps:"
echo "1. cd $REPO_NAME"
echo "2. Review and edit README.md"
echo "3. git add ."
echo "4. git commit -m 'Initial commit'"
echo "5. gh repo create $REPO_NAME --public --source=. --push"
echo ""
echo "📝 Quick commands:"
echo "- Add idea: ./scripts/add-idea.sh \"My idea\" automation"
echo "- Convert code: ./scripts/convert-code.sh my-script.py"
echo "- Generate: ./scripts/generate.sh my-prompt poc"
echo ""
