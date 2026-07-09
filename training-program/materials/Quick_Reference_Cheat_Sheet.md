# Claude AI Training Program - Quick Reference Cheat Sheet
## One-Page Guides for Rapid Implementation

---

## PAGE 1: CLAUDE BASICS AT A GLANCE

### Three Ways to Access Claude
- **Web**: claude.ai (browser-based, free)
- **API**: Integrate Claude into your apps (developers)
- **Plugins**: IDE extensions for VS Code, JetBrains

### Claude Models Quick Comparison
```
┌─────────────┬──────────────┬─────────┬──────────────┐
│   Model     │   Best For   │  Speed  │   Cost       │
├─────────────┼──────────────┼─────────┼──────────────┤
│   Opus      │ Complex work │  Slower │ More $$      │
│   Sonnet    │ Most tasks   │ Fast    │ Balanced     │
│   Haiku     │ Quick tasks  │ Fastest │ Least $      │
└─────────────┴──────────────┴─────────┴──────────────┘
```

### Key Features at a Glance
| Feature | Use For | How |
|---------|---------|-----|
| **Projects** | Organized conversations | Create project > Add team > Chat |
| **Knowledge Files** | Permanent context | Upload PDFs to project |
| **File Uploads** | Analyze documents | Drag & drop files into chat |
| **Artifacts** | Create content | Ask Claude to "create an artifact" |
| **Image Upload** | Analyze images | Upload PNG/JPG for analysis |

### Context Window Explained
```
Tokens: Basic unit of text (1 token ≈ 4 words)

- Sonnet/Haiku: 100K tokens = 40,000 words (typical book)
- Opus: 200K tokens = 80,000 words (research paper)
- Can upload entire files: PDFs, contracts, codebases
```

### Privacy & Security ✓
- Your conversations are NOT used to train Claude
- Encrypted in transit and at rest
- Meets SOC 2 compliance
- Check privacy policy for your region

---

## PAGE 2: THE ANATOMY OF GREAT PROMPTS

### The Prompt Formula
```
[CONTEXT] + [TASK] + [FORMAT] = BETTER RESULTS
```

### Essential Elements

**1. CONTEXT** (Tell Claude what it needs to know)
```
✓ Who you are: "You're a marketing expert..."
✓ What you do: "We sell B2B SaaS..."
✓ What matters: "We emphasize ROI..."
✓ What constrains us: "Keep under $5K budget..."
```

**2. TASK** (What you want done)
```
✓ Be specific: "Write a cold email to IT managers about our product"
✓ Be clear: "Generate 5 product names"
✓ Include constraints: "3 sentences, active voice"
```

**3. FORMAT** (How you want the answer)
```
✓ Bullet points     ✓ Email format      ✓ Markdown table
✓ Numbered list     ✓ Conversation      ✓ JSON format
✓ Paragraph         ✓ Story             ✓ Structured outline
```

### Prompt Writing Quick Tips

| DON'T | DO |
|-------|-----|
| ❌ "Write an email" | ✓ "Write a 3-paragraph cold email to IT director about our AI solution. Tone: friendly. CTA: ask for 15-min call." |
| ❌ "Summarize this document" | ✓ "Summarize this quarterly report in 5 bullet points, focusing on revenue growth and cost control." |
| ❌ "Help me analyze data" | ✓ "Analyze these quarterly sales numbers and identify which product categories are trending upward." |

### Power Moves

**Role Prompting**: Start with "You are a [ROLE]"
```
"You are a seasoned financial analyst. Analyze this cash flow..."
Results in: Detailed financial language, sophisticated thinking
```

**Few-Shot Prompting**: Show examples of desired output
```
"Example email:
Subject: Quick question about [Company]
Hi [Name], I noticed [Observation]...

Using that style, write an email to..."
Results in: Consistent tone and format
```

**Chain-of-Thought**: Ask Claude to show reasoning
```
"Let's think through this step by step..."
"Before answering, what factors are most important?"
Results in: More accurate, verifiable answers
```

---

## PAGE 3: ITERATIVE REFINEMENT

### The Refinement Cycle
```
1. First attempt        Get initial response
2. Review output        Check quality vs. need
3. Adjust request       Give specific feedback
4. Get revised answer   Compare to first attempt
5. Repeat if needed     Continue until perfect
```

### Refinement Phrases That Work

| Goal | Phrase |
|------|--------|
| Shorter | "Make this more concise" or "Trim to 150 words" |
| Longer | "Expand each point with more detail" |
| Different tone | "Make this more conversational" or "Sound more formal" |
| Format change | "Put this in a table format" or "Use bullet points" |
| Add something | "Add examples for each point" |
| Remove something | "Focus on the top 3 issues" |
| Better quality | "Improve this to CEO presentation quality" |

### Example Iteration
```
Round 1: "Write a social media post about our new product"
→ Gets: Generic post

Round 2: "That's too salesy. Make it more about the customer problem. Include a relatable scenario"
→ Gets: Better, problem-focused

Round 3: "Perfect! Now write 3 variations with different angles - one for LinkedIn, one for Twitter, one for Instagram"
→ Gets: Platform-specific versions
```

---

## PAGE 4: WORKING WITH FILES & DOCUMENTS

### File Upload Guide

**What You Can Upload:**
- ✓ PDF files (up to 100 pages)
- ✓ Word documents (.docx)
- ✓ Excel spreadsheets (.xlsx)
- ✓ Text files (.txt)
- ✓ Images (PNG, JPG)

**Upload Process:**
1. Click attachment icon in Claude
2. Select your file
3. Claude analyzes automatically
4. Ask questions about the content
5. Claude cites sources in answers

### Example Questions by File Type

**For PDFs:**
```
"Summarize the key points in 5 bullets"
"What's the main conclusion?"
"Extract all financial figures"
"What recommendations do they make?"
"Create an outline of this document"
```

**For Spreadsheets:**
```
"What are the top 5 values in column A?"
"Identify any trends in this data"
"Create a summary of this by department"
"What's the average? Max? Min?"
"Spot any anomalies or outliers"
```

**For Images:**
```
"What's shown in this image?"
"Extract text from this screenshot"
"Analyze this chart and explain trends"
"Describe the layout of this page"
"What would you improve about this design?"
```

### Knowledge Files (Advanced)

**What They Are:** Permanent documents that Claude remembers across conversations

**Setup:**
1. Create a Claude Project
2. Upload PDFs to the project
3. Claude remembers them automatically
4. Ask questions about them anytime

**Good Use Cases:**
- Brand guidelines
- Company policies
- Product documentation
- Client contracts
- Internal playbooks

---

## PAGE 5: COMMON PROMPTING MISTAKES & FIXES

### Mistake #1: Too Vague
```
❌ "Analyze our sales data"
✓ "Analyze our Q3 sales data. What products grew most?
  What regions underperformed? Why?"
```

### Mistake #2: Too Many Tasks at Once
```
❌ "Write an email, plan a campaign, and create a budget"
✓ [Send one clear prompt per task]
```

### Mistake #3: Not Enough Context
```
❌ "Write a proposal"
✓ "Write a proposal for XYZ Company (tech startup, 50 people)
  for our AI consulting services. Emphasize ROI and
  implementation timeline. $50K budget."
```

### Mistake #4: Unclear Format
```
❌ "Tell me about our competitors"
✓ "Create a comparison table of our top 3 competitors.
  Columns: Company, Product, Price, Unique Strength"
```

### Mistake #5: Not Iterating
```
❌ "This isn't good" [gives up]
✓ "This is close but needs more personality.
  Add humor and make it more conversational."
```

### Mistake #6: Expecting Perfection
```
❌ First draft = final version
✓ First draft → Review → Refine 2-3x → Ready to use
```

---

## PAGE 6: WORKING SMARTER (TIME-SAVING TIPS)

### Batch Similar Tasks
```
Instead of: 5 separate requests for 5 emails

Better:
"I need 5 cold emails to different roles.
Email 1: [Target 1, context]
Email 2: [Target 2, context]
Email 3: [Target 3, context]
...
Use similar structure but personalize each."
```

### Use Templates
```
Instead of: Recreating the same prompt every time

Better:
Create template:
"You are [ROLE]. Please [TASK].
Context: [CONTEXT]
Format: [FORMAT]
Constraints: [CONSTRAINTS]"

Reuse and modify for variations
```

### Save Your Best Prompts
```
Create a "Prompt Library" document with:
- Prompt name
- Full prompt text
- What it's good for
- When to use
- Tips for getting best results
```

### Chain Requests
```
Request 1: Research a topic
Request 2: Use that research to write something
Request 3: Use that output to create next thing

Claude remembers the conversation, so each builds on previous.
```

---

## PAGE 7: RESPONSIBLE AI CHECKLIST

### Before You Use Claude for Anything Important

- [ ] **Is this the right tool?** Will Claude actually help here?
- [ ] **Am I being specific?** Clear prompt = better answer
- [ ] **Do I need to verify?** For facts/numbers, double-check independently
- [ ] **Who's affected?** Think about consequences of using AI-generated content
- [ ] **Is it legal?** Make sure use case is appropriate
- [ ] **Should I disclose?** If using AI to write something external-facing, does audience need to know?
- [ ] **Is data sensitive?** Never share passwords, PII, or confidential data

### Questions Claude Might Struggle With
```
❌ Current events (trained only through early 2024)
❌ Confidential company data (unless you trust Claude)
❌ Legal/medical advice (always verify with experts)
❌ Recent market data (verify numbers independently)
❌ Specific internal policies (use your knowledge base)
```

---

## PAGE 8: KEYBOARD SHORTCUTS & TIPS

### Claude Web Interface Shortcuts
```
Ctrl/Cmd + K       → Open command menu
Ctrl/Cmd + Shift + L → Toggle sidebar
Ctrl/Cmd + /       → Show keyboard shortcuts
Tab                → Autocomplete common phrases
```

### Markdown Formatting in Prompts
```
Use markdown in your prompts for clarity:

**Bold**: **important words**
_Italic_: _emphasis_
`Code`: `function_name()`
# Headers: Structure long prompts
- Bullets: Lists of items
1. Numbers: Ordered lists
[Links](url): Reference URLs
```

### Smart Tricks
```
1. Keep Claude on task: "Only answer this specific question"
2. Get multiple options: "Give me 3 different approaches"
3. Challenge Claude: "Play devil's advocate: what's wrong with this plan?"
4. Reference history: "Earlier you said... how does that connect?"
5. Save output: Download/copy-paste good responses to your files
```

---

## PAGE 9: YOUR WEEKLY WORKFLOW

### Monday: Plan & Brainstorm
```
"Help me plan my week. I need to:
- [Task 1]
- [Task 2]
- [Task 3]
What's the best approach for each?"
```

### Tuesday-Thursday: Execute
```
Use Claude for:
- Writing (emails, documents, content)
- Analysis (data interpretation, summaries)
- Brainstorming (ideas, approaches, solutions)
- Research (competitor analysis, market insights)
- Formatting (structure, organize, clean up)
```

### Friday: Review & Prepare
```
"Summarize this week's work and outcomes"
"Prepare a weekly status update with key achievements"
"What should we focus on next week?"
```

---

## PAGE 10: QUICK REFERENCE - WHEN TO USE CLAUDE

### Perfect For:
✓ First drafts of writing
✓ Brainstorming ideas
✓ Summarizing documents
✓ Analyzing data
✓ Research and learning
✓ Code generation and debugging
✓ Prompt templates and workflows
✓ Routine task automation

### Great For (With Review):
⚠ Customer-facing writing (review tone)
⚠ Technical analysis (verify correctness)
⚠ Data analysis (validate numbers)
⚠ Complex decisions (use as one input)
⚠ Legal/compliance items (review with experts)

### NOT For:
✗ Confidential/sensitive data
✗ Personal information (PII)
✗ Passwords or credentials
✗ Final decisions without human review
✗ Time-sensitive current events
✗ Completely novel/untested approaches without validation

---

## STILL NEED HELP?

### Common Questions Quick Answers

**Q: Which model should I use?**
A: Sonnet. It's fast, capable, and cost-effective for 90% of tasks.

**Q: Can Claude see my files?**
A: Only files you upload in the conversation. Use Projects for permanent file access.

**Q: Will my data train Claude?**
A: No. Your conversations don't train Claude (with few exceptions - see privacy).

**Q: How do I get better results?**
A: Be specific, provide context, and iterate. First pass is rarely perfect.

**Q: What's a "token"?**
A: Roughly 4 words per token. Your context window determines how much Claude can "see."

**Q: Should I use Claude for [my specific task]?**
A: If it saves time and doesn't involve sensitive data, yes. Test with non-critical work first.

---

## YOUR QUICK WINS (This Week)

1. **Monday**: Create 3 prompts for recurring tasks
2. **Tuesday**: Use Claude to draft something you normally write
3. **Wednesday**: Analyze a document/dataset with Claude
4. **Thursday**: Build a template prompt for your team
5. **Friday**: Share your best prompt with a colleague

---

**Remember**: Claude is a tool to amplify your capabilities.
The better your questions, the better your results.
Start simple, iterate, and build your prompt library over time.

Good luck! 🚀
