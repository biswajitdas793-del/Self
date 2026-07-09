#!/usr/bin/env python3
"""
Claude AI Training Program - Presentation Generator
Generates a comprehensive 120+ slide training presentation for Isharya
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
import os

# Anthropic-inspired color scheme
COLORS = {
    'primary': RGBColor(34, 34, 34),      # Dark gray
    'accent': RGBColor(212, 41, 78),      # Anthropic red
    'light_bg': RGBColor(245, 245, 245),  # Light gray
    'text': RGBColor(50, 50, 50),         # Dark text
    'light_text': RGBColor(255, 255, 255), # White text
    'secondary': RGBColor(100, 100, 100),  # Medium gray
}

class TrainingPresentation:
    def __init__(self):
        self.prs = Presentation()
        self.prs.slide_width = Inches(10)
        self.prs.slide_height = Inches(7.5)
        self.slide_count = 0

    def add_title_slide(self, title, subtitle=""):
        """Add a title slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])  # Blank layout
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = COLORS['primary']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(9), Inches(2))
        title_frame = title_box.text_frame
        title_frame.word_wrap = True
        p = title_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(54)
        p.font.bold = True
        p.font.color.rgb = COLORS['light_text']
        p.alignment = PP_ALIGN.CENTER

        # Subtitle
        if subtitle:
            subtitle_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.5), Inches(9), Inches(1.5))
            subtitle_frame = subtitle_box.text_frame
            subtitle_frame.word_wrap = True
            p = subtitle_frame.paragraphs[0]
            p.text = subtitle
            p.font.size = Pt(24)
            p.font.color.rgb = COLORS['accent']
            p.alignment = PP_ALIGN.CENTER

        self.slide_count += 1

    def add_section_slide(self, section_title, slides_info):
        """Add a section divider slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = COLORS['light_bg']

        # Add accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.3), Inches(7.5))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Section title
        title_box = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(8), Inches(1))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = section_title
        p.font.size = Pt(48)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Info
        info_box = slide.shapes.add_textbox(Inches(1), Inches(4), Inches(8), Inches(2.5))
        info_frame = info_box.text_frame
        info_frame.word_wrap = True
        p = info_frame.paragraphs[0]
        p.text = slides_info
        p.font.size = Pt(18)
        p.font.color.rgb = COLORS['secondary']

        self.slide_count += 1

    def add_content_slide(self, title, content_points):
        """Add a content slide with bullet points"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])

        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(255, 255, 255)

        # Accent bar at top
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(0.15))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.35), Inches(9), Inches(0.8))
        title_frame = title_box.text_frame
        title_frame.word_wrap = True
        p = title_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(40)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Content
        content_box = slide.shapes.add_textbox(Inches(0.75), Inches(1.5), Inches(8.5), Inches(5.5))
        text_frame = content_box.text_frame
        text_frame.word_wrap = True

        for i, point in enumerate(content_points):
            if i == 0:
                p = text_frame.paragraphs[0]
            else:
                p = text_frame.add_paragraph()

            p.text = point
            p.level = 0
            p.font.size = Pt(18)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(6)
            p.space_after = Pt(6)

            # Add bullet
            p.font.bold = False

        self.slide_count += 1

    def add_learning_objectives_slide(self, objectives):
        """Add learning objectives slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])

        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(255, 255, 255)

        # Accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(0.15))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.35), Inches(9), Inches(0.8))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = "Learning Objectives"
        p.font.size = Pt(40)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Objectives
        obj_box = slide.shapes.add_textbox(Inches(1), Inches(1.5), Inches(8), Inches(5.5))
        text_frame = obj_box.text_frame
        text_frame.word_wrap = True

        for i, obj in enumerate(objectives):
            if i == 0:
                p = text_frame.paragraphs[0]
            else:
                p = text_frame.add_paragraph()

            p.text = f"✓ {obj}"
            p.font.size = Pt(18)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(8)
            p.space_after = Pt(8)

        self.slide_count += 1

    def add_two_column_slide(self, title, left_title, left_points, right_title, right_points):
        """Add two-column comparison slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])

        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(255, 255, 255)

        # Accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(0.15))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.35), Inches(9), Inches(0.8))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(40)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Left column
        left_title_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.4), Inches(4), Inches(0.4))
        left_title_frame = left_title_box.text_frame
        p = left_title_frame.paragraphs[0]
        p.text = left_title
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = COLORS['accent']

        left_content_box = slide.shapes.add_textbox(Inches(0.5), Inches(2), Inches(4), Inches(5))
        left_content_frame = left_content_box.text_frame
        left_content_frame.word_wrap = True
        for i, point in enumerate(left_points):
            if i == 0:
                p = left_content_frame.paragraphs[0]
            else:
                p = left_content_frame.add_paragraph()
            p.text = f"• {point}"
            p.font.size = Pt(15)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(4)
            p.space_after = Pt(4)

        # Right column
        right_title_box = slide.shapes.add_textbox(Inches(5.5), Inches(1.4), Inches(4), Inches(0.4))
        right_title_frame = right_title_box.text_frame
        p = right_title_frame.paragraphs[0]
        p.text = right_title
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = COLORS['accent']

        right_content_box = slide.shapes.add_textbox(Inches(5.5), Inches(2), Inches(4), Inches(5))
        right_content_frame = right_content_box.text_frame
        right_content_frame.word_wrap = True
        for i, point in enumerate(right_points):
            if i == 0:
                p = right_content_frame.paragraphs[0]
            else:
                p = right_content_frame.add_paragraph()
            p.text = f"• {point}"
            p.font.size = Pt(15)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(4)
            p.space_after = Pt(4)

        self.slide_count += 1

    def add_exercise_slide(self, title, instructions, deliverables, duration):
        """Add hands-on exercise slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])

        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = COLORS['light_bg']

        # Accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.3), Inches(7.5))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(9), Inches(0.7))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = f"🎯 {title}"
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Duration badge
        duration_box = slide.shapes.add_textbox(Inches(8.5), Inches(0.3), Inches(1.2), Inches(0.5))
        duration_frame = duration_box.text_frame
        p = duration_frame.paragraphs[0]
        p.text = f"⏱️ {duration}"
        p.font.size = Pt(14)
        p.font.color.rgb = COLORS['accent']

        # Instructions header
        inst_header_box = slide.shapes.add_textbox(Inches(0.75), Inches(1.2), Inches(8.5), Inches(0.3))
        inst_header_frame = inst_header_box.text_frame
        p = inst_header_frame.paragraphs[0]
        p.text = "Instructions:"
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Instructions
        inst_box = slide.shapes.add_textbox(Inches(0.75), Inches(1.6), Inches(8.5), Inches(2.5))
        inst_frame = inst_box.text_frame
        inst_frame.word_wrap = True
        for i, instruction in enumerate(instructions):
            if i == 0:
                p = inst_frame.paragraphs[0]
            else:
                p = inst_frame.add_paragraph()
            p.text = f"{i+1}. {instruction}"
            p.font.size = Pt(16)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(4)
            p.space_after = Pt(4)

        # Deliverables header
        deliv_header_box = slide.shapes.add_textbox(Inches(0.75), Inches(4.3), Inches(8.5), Inches(0.3))
        deliv_header_frame = deliv_header_box.text_frame
        p = deliv_header_frame.paragraphs[0]
        p.text = "Expected Deliverables:"
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Deliverables
        deliv_box = slide.shapes.add_textbox(Inches(0.75), Inches(4.7), Inches(8.5), Inches(2.5))
        deliv_frame = deliv_box.text_frame
        deliv_frame.word_wrap = True
        for i, deliverable in enumerate(deliverables):
            if i == 0:
                p = deliv_frame.paragraphs[0]
            else:
                p = deliv_frame.add_paragraph()
            p.text = f"✓ {deliverable}"
            p.font.size = Pt(16)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(4)
            p.space_after = Pt(4)

        self.slide_count += 1

    def add_use_case_slide(self, title, department, challenge, solution, results):
        """Add real business use case slide"""
        slide = self.prs.slides.add_slide(self.prs.slide_layouts[6])

        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(255, 255, 255)

        # Accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(0.15))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLORS['accent']
        bar.line.color.rgb = COLORS['accent']

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.35), Inches(9), Inches(0.7))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = f"📊 {title}"
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = COLORS['primary']

        # Department
        dept_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.1), Inches(9), Inches(0.3))
        dept_frame = dept_box.text_frame
        p = dept_frame.paragraphs[0]
        p.text = f"Department: {department}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLORS['secondary']

        # Challenge
        challenge_label = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(1.5), Inches(0.3))
        challenge_label_frame = challenge_label.text_frame
        p = challenge_label_frame.paragraphs[0]
        p.text = "Challenge:"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLORS['accent']

        challenge_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.85), Inches(9), Inches(1))
        challenge_frame = challenge_box.text_frame
        challenge_frame.word_wrap = True
        p = challenge_frame.paragraphs[0]
        p.text = challenge
        p.font.size = Pt(14)
        p.font.color.rgb = COLORS['text']

        # Solution
        solution_label = slide.shapes.add_textbox(Inches(0.5), Inches(2.95), Inches(1.5), Inches(0.3))
        solution_label_frame = solution_label.text_frame
        p = solution_label_frame.paragraphs[0]
        p.text = "Solution:"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLORS['accent']

        solution_box = slide.shapes.add_textbox(Inches(0.5), Inches(3.3), Inches(9), Inches(1))
        solution_frame = solution_box.text_frame
        solution_frame.word_wrap = True
        p = solution_frame.paragraphs[0]
        p.text = solution
        p.font.size = Pt(14)
        p.font.color.rgb = COLORS['text']

        # Results
        results_label = slide.shapes.add_textbox(Inches(0.5), Inches(4.4), Inches(1.5), Inches(0.3))
        results_label_frame = results_label.text_frame
        p = results_label_frame.paragraphs[0]
        p.text = "Results:"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLORS['accent']

        results_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.75), Inches(9), Inches(2.3))
        results_frame = results_box.text_frame
        results_frame.word_wrap = True
        for i, result in enumerate(results):
            if i == 0:
                p = results_frame.paragraphs[0]
            else:
                p = results_frame.add_paragraph()
            p.text = f"✓ {result}"
            p.font.size = Pt(14)
            p.font.color.rgb = COLORS['text']
            p.space_before = Pt(3)
            p.space_after = Pt(3)

        self.slide_count += 1

    def save(self, filename):
        """Save presentation to file"""
        self.prs.save(filename)
        print(f"✓ Presentation saved: {filename}")
        print(f"✓ Total slides: {self.slide_count}")


def generate_training_presentation():
    """Generate the complete 5-week training presentation"""
    prs = TrainingPresentation()

    # ========== OPENING ==========
    prs.add_title_slide(
        "Claude AI Training Program",
        "Master Generative AI for Business Productivity"
    )

    prs.add_content_slide(
        "Program Overview",
        [
            "5-week comprehensive training program",
            "Learn to leverage Claude AI in your daily workflows",
            "Practical, hands-on exercises for all departments",
            "Real business use cases and ROI metrics",
            "Certification upon completion"
        ]
    )

    prs.add_content_slide(
        "Who Should Attend",
        [
            "HR & Talent Management teams",
            "Marketing & Communications professionals",
            "Sales & Business Development teams",
            "Customer Support & Service teams",
            "Operations & Finance teams",
            "Leadership & Management",
            "All skill levels from beginners to intermediate users"
        ]
    )

    prs.add_section_slide(
        "WEEK 1: AI & Claude Fundamentals",
        "Building foundational knowledge about AI, Claude, and essential tools"
    )

    # ========== WEEK 1 ==========
    prs.add_learning_objectives_slide([
        "Understand AI and Generative AI fundamentals",
        "Learn about Large Language Models and how they work",
        "Become familiar with Claude and Anthropic",
        "Explore Claude's interface and core features",
        "Understand responsible AI and security",
        "Start using Claude for basic business tasks"
    ])

    prs.add_content_slide(
        "What is Artificial Intelligence?",
        [
            "• AI: Systems designed to perform tasks that typically require human intelligence",
            "• Machine Learning: Systems that improve from data without explicit programming",
            "• Deep Learning: Neural networks inspired by the human brain",
            "• Generative AI: Systems that create new content (text, images, code, etc.)",
            "• Key Distinction: Generative AI focuses on creating, not just classifying"
        ]
    )

    prs.add_content_slide(
        "Large Language Models (LLMs)",
        [
            "• What They Are: Neural networks trained on massive amounts of text",
            "• How They Work: Predict the next word based on context and patterns",
            "• Training Data: Diverse internet text, books, articles (with careful curation)",
            "• Parameters: Billions of numerical weights that enable understanding",
            "• Generative Process: Iteratively predict and generate human-like text"
        ]
    )

    prs.add_content_slide(
        "The Evolution of AI",
        [
            "• 2011: IBM Watson wins Jeopardy!",
            "• 2016: AlphaGo defeats Lee Sedol at Go",
            "• 2018: BERT and GPT-1 emerge",
            "• 2020: GPT-3 demonstrates few-shot learning",
            "• 2022: ChatGPT crosses 1M users in days",
            "• 2023-2024: Claude 3 family raises new standards for capability and safety"
        ]
    )

    prs.add_content_slide(
        "Meet Claude",
        [
            "• Developed by: Anthropic (AI safety company)",
            "• Purpose: Safe, helpful, and honest AI assistant",
            "• Approach: Constitutional AI - trained with human feedback and principles",
            "• Strengths: Nuanced reasoning, accuracy, long-context understanding",
            "• Available: Web, API, IDE plugins, ChatGPT-like interface",
            "• Philosophy: Transparency and responsible deployment"
        ]
    )

    prs.add_content_slide(
        "About Anthropic",
        [
            "• Founded: 2021 by former members of OpenAI",
            "• Mission: Develop safe, beneficial AI",
            "• Focus: Constitutional AI, interpretability, and responsible scaling",
            "• Research: Published groundbreaking papers on AI safety",
            "• Commitment: AI should augment human capabilities, not replace them",
            "• Values: Transparency, rigorous testing, ethical deployment"
        ]
    )

    prs.add_content_slide(
        "Claude Model Family",
        [
            "• Claude 3 Opus: Most capable, best for complex reasoning",
            "• Claude 3 Sonnet: Balanced performance and speed",
            "• Claude 3 Haiku: Fastest, most compact, ideal for high-volume tasks",
            "• Context Window: 100K tokens (Sonnet, Haiku); 200K tokens (Opus)",
            "• Tokens: ~4 words = 1 token; allows processing long documents",
            "• Latest: Claude 3.5 family with enhanced capabilities"
        ]
    )

    prs.add_two_column_slide(
        "Claude Models Comparison",
        "Opus",
        [
            "Best for complex tasks",
            "Highest accuracy",
            "Longer processing time",
            "Most expensive per token",
            "Ideal for critical decisions"
        ],
        "Sonnet",
        [
            "Best balanced choice",
            "Fast and capable",
            "Cost-effective",
            "Suitable for most tasks",
            "Production workload"
        ]
    )

    prs.add_content_slide(
        "Claude's Core Features",
        [
            "• Projects: Organized workspaces for related conversations",
            "• Knowledge Files: Upload documents for analysis and reference",
            "• Artifacts: Rich content creation (code, documents, visualizations)",
            "• File Uploads: Process PDFs, images, documents",
            "• Image Understanding: Analyze screenshots, diagrams, photos",
            "• Context Window: Process entire books or codebases",
            "• Search: Find and cite information from your knowledge base"
        ]
    )

    prs.add_content_slide(
        "Claude Interface Overview",
        [
            "Web Interface (claude.ai): Chat-based interaction",
            "Projects Tab: Organize conversations by project or department",
            "Upload Pane: Attach files for analysis",
            "Assistant Panel: Configure system prompts and settings",
            "Conversation History: Review and export past interactions",
            "Mobile App: Access Claude on the go"
        ]
    )

    prs.add_content_slide(
        "Projects & Organization",
        [
            "• Create projects for different departments or initiatives",
            "• Share projects with team members (enterprise feature)",
            "• Store related conversations in one place",
            "• Use custom instructions for project-specific behavior",
            "• Examples: Marketing Campaigns, Sales Proposals, HR Analytics",
            "• Benefits: Better context, improved organization, team collaboration"
        ]
    )

    prs.add_content_slide(
        "Knowledge Files & Context",
        [
            "• Upload up to 20 PDFs per conversation",
            "• Process documents up to 100K tokens",
            "• Claude cites sources in responses",
            "• Use for: Brand guidelines, company policies, product specs",
            "• Workflow: Upload > Claude reads > Analyze > Generate insights",
            "• Privacy: Files stored securely in your account"
        ]
    )

    prs.add_content_slide(
        "Artifacts & Rich Content",
        [
            "• Create and edit documents, code, and visualizations",
            "• HTML/CSS/JavaScript for interactive content",
            "• Python, JavaScript, React for applications",
            "• Standalone viewing and execution",
            "• Easy sharing and collaboration",
            "• Export and download capabilities"
        ]
    )

    prs.add_content_slide(
        "File Upload Capabilities",
        [
            "• Supported Formats: PDF, TXT, DOCX, XLSX, images (PNG, JPG)",
            "• Size Limits: Up to 20 files per conversation",
            "• Processing: Instant analysis and understanding",
            "• Use Cases: Contract review, data analysis, image recognition",
            "• Quality: Works with scanned documents and complex layouts",
            "• Storage: Uploaded files are secure and private"
        ]
    )

    prs.add_content_slide(
        "Image Understanding",
        [
            "• Analyze screenshots, charts, diagrams, and photos",
            "• Extract text from images (OCR)",
            "• Interpret data visualizations",
            "• Understand context and meaning",
            "• Use Cases: UI/UX feedback, data analysis, competitor research",
            "• Combine images with text for richer context"
        ]
    )

    prs.add_content_slide(
        "Context Window Explained",
        [
            "• Context: All information Claude can 'see' in a conversation",
            "• Tokens: Measurement of text size (1 token ≈ 4 words)",
            "• 100K-200K token window: Equivalent to 40,000-80,000 words",
            "• Practical Limit: A 400-page book or entire codebase",
            "• Advantage: Process entire documents in one conversation",
            "• Better: More context = more accurate responses"
        ]
    )

    prs.add_two_column_slide(
        "Claude vs. ChatGPT vs. Gemini vs. Copilot",
        "Claude",
        [
            "Strength: Reasoning & safety",
            "Best for: Analysis, writing",
            "Context: 100K-200K tokens",
            "Speed: Opus slower, Sonnet fast",
            "API: Available"
        ],
        "ChatGPT",
        [
            "Strength: Popularity, ecosystem",
            "Best for: General tasks",
            "Context: 128K tokens",
            "Speed: Very fast",
            "API: Widely available"
        ]
    )

    prs.add_content_slide(
        "Responsible AI & Ethics",
        [
            "• Transparency: Understand AI limitations and capabilities",
            "• Human Oversight: AI augments, not replaces human judgment",
            "• Bias Awareness: AI can inherit biases from training data",
            "• Privacy First: Never share sensitive/PII with AI systems",
            "• Fact-Checking: Verify outputs before using for decisions",
            "• Ethical Use: Consider implications of AI-generated content"
        ]
    )

    prs.add_content_slide(
        "Security & Privacy with Claude",
        [
            "• Encryption: All data encrypted in transit and at rest",
            "• No Data Training: Your conversations don't train Claude",
            "• Privacy Mode: Enterprise option for enhanced security",
            "• SOC 2 Certified: Meets enterprise security standards",
            "• GDPR Compliant: Respects data protection regulations",
            "• Audit Trail: Track who accessed what and when"
        ]
    )

    prs.add_content_slide(
        "Getting Started: Your First Prompt",
        [
            "• Anatomy: Task + Context + Format",
            "• Simple: 'Summarize this quarterly report'",
            "• Better: 'Summarize this Q3 report for a board meeting, 2-3 paragraphs'",
            "• Best: [Context] Please summarize [specific info] in [format]",
            "• Don't overcomplicate: Start simple and iterate",
            "• Experiment: Try different phrasings to see what works best"
        ]
    )

    prs.add_exercise_slide(
        "Setting Up Your Claude Account",
        [
            "Visit claude.ai and create your account",
            "Explore the interface and menu options",
            "Create your first Project named 'Training'",
            "Upload a sample document (PDF or text)",
            "Send your first prompt to Claude"
        ],
        [
            "Active Claude account with profile completed",
            "First project created and documented",
            "Sample conversation with uploaded file"
        ],
        "30 minutes"
    )

    prs.add_exercise_slide(
        "Hands-On: Document Summarization",
        [
            "Find a business document (report, article, email)",
            "Upload it to Claude",
            "Ask Claude to summarize it in 3-5 bullet points",
            "Try different formats: bullets, paragraph, table",
            "Note what works best for your use case"
        ],
        [
            "3-5 bullet point summary",
            "Paragraph format summary",
            "Observation of which format is most useful"
        ],
        "45 minutes"
    )

    prs.add_exercise_slide(
        "Hands-On: Email Draft Writing",
        [
            "Describe a business situation needing an email",
            "Ask Claude to draft the email with tone/length",
            "Iterate: refine tone, length, specific details",
            "Customize for your role and audience",
            "Critique: Is it professional? Does it sound natural?"
        ],
        [
            "First draft email",
            "Revised version with specific feedback",
            "Final polished email ready to send"
        ],
        "45 minutes"
    )

    prs.add_content_slide(
        "Week 1 Homework Assignment",
        [
            "Complete 20 prompts related to your job role",
            "Categories: 5 summarization, 5 writing, 5 analysis, 5 brainstorming",
            "Document: Save prompts and outputs in a workbook",
            "Reflection: Note what worked and what didn't",
            "Share: Bring 3 examples to discuss in Week 2",
            "Goal: Build comfort with Claude's capabilities"
        ]
    )

    prs.add_content_slide(
        "Week 1 Quiz Preview",
        [
            "Quiz covers: AI fundamentals, LLMs, Claude features",
            "Format: 10 multiple choice + 2 short answer questions",
            "Duration: 15 minutes",
            "Access: Online through training portal",
            "Passing Score: 70% required",
            "Review: Solutions provided after submission"
        ]
    )

    prs.add_content_slide(
        "Week 1 Key Takeaways",
        [
            "✓ AI and Generative AI are transformative technologies",
            "✓ Claude is a sophisticated but accessible tool",
            "✓ Understanding your tool enables better use",
            "✓ Security and ethics are built-in, not afterthoughts",
            "✓ Practice and iteration improve results",
            "✓ Start simple, build complexity over time"
        ]
    )

    # ========== SECTION 2 ==========
    prs.add_section_slide(
        "WEEK 2: Prompt Engineering Mastery",
        "Learn to craft effective prompts that get better results from Claude"
    )

    # ========== WEEK 2 ==========
    prs.add_learning_objectives_slide([
        "Master the anatomy of effective prompts",
        "Learn role-based and context-based prompting",
        "Understand XML and Markdown prompt structures",
        "Apply few-shot prompting for consistency",
        "Develop iterative refinement skills",
        "Build and manage a personal prompt library"
    ])

    prs.add_content_slide(
        "The Anatomy of a Great Prompt",
        [
            "• Context: What Claude needs to know",
            "• Task: What you want Claude to do",
            "• Format: How you want the response",
            "• Constraints: Any limitations or parameters",
            "• Examples: Few-shot demonstrations (optional)",
            "• Formula: [Context] + [Task] + [Format] = Better results"
        ]
    )

    prs.add_content_slide(
        "Good Prompt vs. Great Prompt",
        [
            "❌ Bad: 'Write an email'",
            "✓ Good: 'Write a professional email to a client'",
            "✓✓ Great: 'Write a 3-paragraph professional email to a prospect about our new product. Tone: friendly but authoritative. Include 1 call-to-action.'",
            "Key Difference: Specificity and context",
            "Rule: More detailed prompts = More aligned results",
            "Test: If you can understand your request, Claude can too"
        ]
    )

    prs.add_content_slide(
        "Role Prompting",
        [
            "• Concept: Assign Claude a persona or expertise",
            "• Format: 'You are a [role]. [Task]'",
            "• Examples: 'You are a marketing expert...', 'Act as a financial analyst...'",
            "• Benefit: Claude adapts language, depth, and perspective",
            "• Use Case: Industry-specific terminology, tone matching",
            "• Pro Tip: Combine with context for maximum impact"
        ]
    )

    prs.add_content_slide(
        "Context Prompting",
        [
            "• Concept: Provide relevant background information",
            "• What to Include: Company info, audience, constraints, goals",
            "• Format: 'Background: [context]. Task: [what to do]'",
            "• Benefit: Claude understands nuances and priorities",
            "• Examples: Industry context, target audience, brand guidelines",
            "• Impact: Reduces revisions and improves accuracy"
        ]
    )

    prs.add_content_slide(
        "XML & Markdown Prompt Structures",
        [
            "• XML: Structured tags for clarity and machine-readability",
            "• Example: <role>Marketing Manager</role><task>Create email</task>",
            "• Markdown: Use headers, lists, code blocks for organization",
            "• Example: '## Task\\n- Point 1\\n- Point 2'",
            "• When to Use: Complex multi-part prompts or systems",
            "• Advantage: Improves Claude's understanding of complex requests"
        ]
    )

    prs.add_content_slide(
        "Few-Shot Prompting",
        [
            "• Concept: Show examples of desired output",
            "• Format: 'Example 1: [input] → [desired output]'",
            "• Benefit: Teaches Claude your exact style and format",
            "• Use Case: Consistent tone, specific categories, formatting",
            "• Powerful For: Brand voice, classification, structured output",
            "• Tip: 2-3 examples are usually sufficient"
        ]
    )

    prs.add_content_slide(
        "Iterative Prompting",
        [
            "• Concept: Refine through multiple rounds",
            "• Cycle: Ask → Review → Adjust → Ask Again",
            "• Benefits: Convergence toward perfect response",
            "• Phrases: 'Make it shorter', 'Add more detail', 'Change tone to [X]'",
            "• Efficiency: 2-3 iterations usually sufficient",
            "• Pro Tip: Save iterations to learn what works"
        ]
    )

    prs.add_content_slide(
        "Chain-of-Thought Prompting",
        [
            "• Concept: Ask Claude to show its reasoning",
            "• Format: 'Let's think step by step...', 'Show your reasoning'",
            "• Benefit: More accurate answers, easier to verify logic",
            "• Use Case: Complex analysis, problem-solving, calculations",
            "• Effective For: Getting Claude to catch its own errors",
            "• Example: 'Before answering, list the key factors to consider'"
        ]
    )

    prs.add_content_slide(
        "Output Formatting",
        [
            "• Be Specific: 'Format as a bulleted list', 'Use Markdown table'",
            "• Templates: 'Use this template: [template]'",
            "• Structure: 'Organize into 3 sections: Executive Summary, Details, Next Steps'",
            "• Length: 'Keep under 200 words', 'Aim for 2-3 paragraphs'",
            "• Style: 'Use active voice', 'Adopt a conversational tone'",
            "• Benefit: Saves time on reformatting and reduces back-and-forth"
        ]
    )

    prs.add_content_slide(
        "Building Your Prompt Library",
        [
            "• Create: Document reusable prompts for common tasks",
            "• Organize: Group by function, department, or use case",
            "• Template: Include [Context], [Task], [Format] sections",
            "• Test: Validate each prompt works as expected",
            "• Share: Document for team collaboration",
            "• Maintain: Update based on what you learn"
        ]
    )

    prs.add_content_slide(
        "Prompt Optimization Principles",
        [
            "✓ Clarity: Use simple, direct language",
            "✓ Specificity: Include concrete details and examples",
            "✓ Structure: Organize with headers and lists",
            "✓ Constraints: Set clear boundaries and expectations",
            "✓ Testing: Iterate to find what works best",
            "✓ Documentation: Record successful prompts for reuse"
        ]
    )

    prs.add_exercise_slide(
        "Prompt Rewriting Exercise",
        [
            "Read 5 poorly-written prompts (provided)",
            "Identify what's missing: context, clarity, format",
            "Rewrite each prompt with improvements",
            "Test rewrites against originals (compare outputs)",
            "Note differences in quality and usefulness"
        ],
        [
            "5 rewritten prompts",
            "Analysis of improvements made",
            "Before/after comparison document"
        ],
        "1 hour"
    )

    prs.add_exercise_slide(
        "Build Your Reusable Prompt Templates",
        [
            "Identify 5 recurring tasks in your role",
            "Write a template prompt for each",
            "Include [Context], [Task], [Format] clearly",
            "Test each template with real data",
            "Document tips for best results"
        ],
        [
            "5 template prompts",
            "Test results for each",
            "Usage guide with tips"
        ],
        "1.5 hours"
    )

    prs.add_exercise_slide(
        "Department-Specific Prompt Creation",
        [
            "Work in department groups",
            "Identify 3 common challenges in your department",
            "Create optimized prompts for each",
            "Present to full group for feedback",
            "Refine based on suggestions"
        ],
        [
            "3 tested department prompts",
            "Presentation to group",
            "Refined final versions"
        ],
        "2 hours"
    )

    prs.add_exercise_slide(
        "Prompt Debugging Lab",
        [
            "Receive 5 prompts that generate suboptimal outputs",
            "Analyze why each one isn't working",
            "Revise to improve results",
            "Document the problem and solution",
            "Share learning with peers"
        ],
        [
            "Problem analysis for each prompt",
            "Revised prompts with explanations",
            "Debug checklist for future reference"
        ],
        "1 hour"
    )

    prs.add_content_slide(
        "Week 2 Homework Assignment",
        [
            "Build a personal prompt library with 30+ prompts",
            "Organize by: Writing, Analysis, Brainstorming, Task-specific",
            "For each prompt: Include purpose, template, example",
            "Bonus: Create 5 few-shot examples for your domain",
            "Documentation: Prepare to present 5 favorites in Week 3",
            "Goal: Have battle-tested prompts ready for daily use"
        ]
    )

    prs.add_content_slide(
        "Week 2 Key Takeaways",
        [
            "✓ Prompt quality directly impacts response quality",
            "✓ Structure and specificity are your best tools",
            "✓ Iteration and testing build expertise",
            "✓ Templates enable consistency and speed",
            "✓ Documenting prompts creates organizational knowledge",
            "✓ Share prompts to amplify team productivity"
        ]
    )

    # ========== SECTION 3 ==========
    prs.add_section_slide(
        "WEEK 3: Claude for Business Productivity",
        "Apply Claude to solve real problems across your department"
    )

    # ========== WEEK 3 ==========
    prs.add_learning_objectives_slide([
        "Identify high-impact use cases in your department",
        "Learn department-specific Claude workflows",
        "Master practical business applications",
        "Automate routine tasks with AI",
        "Measure and document productivity gains",
        "Create your first AI-assisted workflow"
    ])

    prs.add_content_slide(
        "Universal Business Use Cases",
        [
            "🔤 Writing: Emails, proposals, reports, content",
            "📊 Analysis: Data interpretation, trend spotting, insights",
            "🧠 Brainstorming: Ideas, problem-solving, strategy",
            "📋 Summarization: Documents, meetings, research",
            "🔄 Formatting: Tables, lists, structured data",
            "✂️ Editing: Proofreading, tone adjustment, refactoring"
        ]
    )

    prs.add_use_case_slide(
        "HR: Candidate Screening & Onboarding",
        "Human Resources",
        "Manual resume review and onboarding materials are time-consuming",
        "Use Claude to automatically extract key qualifications from resumes, draft personalized onboarding plans, and generate interview questions aligned with company culture",
        [
            "60% faster candidate screening",
            "Consistent evaluation criteria",
            "Personalized onboarding reduces time-to-productivity by 30%",
            "Improved retention through better cultural fit"
        ]
    )

    prs.add_content_slide(
        "HR Department Workflows",
        [
            "• Resume Analysis: Extract skills, experience, culture fit",
            "• Interview Questions: Generate role-specific interview guides",
            "• Job Descriptions: Refine and improve JDs with market analysis",
            "• Onboarding: Create personalized checklists and plans",
            "• Policy Documents: Draft and review HR policies",
            "• Employee Communications: Newsletter, announcements, updates"
        ]
    )

    prs.add_use_case_slide(
        "Marketing: Campaign Ideation & Copywriting",
        "Marketing & Communications",
        "Creating compelling marketing campaigns and copywriting requires extensive brainstorming and iteration",
        "Leverage Claude to generate campaign ideas, write social media posts, emails, and ad copy with consistent brand voice",
        [
            "5x faster content creation",
            "Consistent brand messaging across channels",
            "Higher engagement rates through optimized copy",
            "A/B testing ideas ready in minutes"
        ]
    )

    prs.add_content_slide(
        "Marketing Department Workflows",
        [
            "• Campaign Brainstorming: Ideate themes, angles, strategies",
            "• Copywriting: Ads, emails, social posts with brand voice",
            "• Content Calendar: Plan monthly content strategy",
            "• Market Research: Analyze competitors, identify gaps",
            "• Email Sequences: Nurture campaigns, welcome series",
            "• Analytics Interpretation: Translate metrics to insights"
        ]
    )

    prs.add_use_case_slide(
        "Sales: Proposal Writing & Prospect Research",
        "Sales & Business Development",
        "Sales teams spend hours crafting custom proposals and researching prospects",
        "Claude accelerates proposal generation, provides personalized talking points, and creates research summaries for better-informed pitches",
        [
            "4x faster proposal turnaround",
            "Higher win rates through personalized approaches",
            "Better prospect understanding via AI research",
            "More time for actual selling and relationship building"
        ]
    )

    prs.add_content_slide(
        "Sales Department Workflows",
        [
            "• Prospect Research: Background, company info, decision makers",
            "• Proposal Writing: Customized proposals with specific value props",
            "• Talking Points: Role-specific conversation starters",
            "• Email Sequences: Cold outreach with personalization",
            "• Objection Handling: Responses to common sales objections",
            "• Deal Analysis: Win/loss analysis and improvement areas"
        ]
    )

    prs.add_use_case_slide(
        "Customer Support: Response Templates & Knowledge Base",
        "Customer Support & Service",
        "Support teams answer similar questions repeatedly, leading to inconsistency and burnout",
        "Empower support with AI-generated response templates, knowledge base searches, and escalation guidance",
        [
            "50% faster response time",
            "Consistent, high-quality support",
            "Reduced repeat questions through knowledge base",
            "Better escalation decisions via guided recommendations"
        ]
    )

    prs.add_content_slide(
        "Customer Support Department Workflows",
        [
            "• Response Templates: Generate per common issues",
            "• Knowledge Base Search: Find relevant solutions instantly",
            "• Tone Matching: Professional yet empathetic responses",
            "• Ticket Analysis: Identify escalation-worthy issues",
            "• FAQ Development: Compile common questions and answers",
            "• Customer Sentiment: Analyze feedback for improvements"
        ]
    )

    prs.add_use_case_slide(
        "Operations: Process Documentation & SOP Creation",
        "Operations & Administration",
        "Creating and maintaining SOPs is tedious; documentation often becomes outdated",
        "Use Claude to draft, update, and organize operational procedures with clear steps, examples, and troubleshooting guides",
        [
            "80% faster SOP documentation",
            "Clearer, more consistent procedures",
            "Easier onboarding for new team members",
            "Reduced errors through standardized processes"
        ]
    )

    prs.add_content_slide(
        "Operations Department Workflows",
        [
            "• SOP Documentation: Standardize procedures across teams",
            "• Process Improvement: Analyze and optimize workflows",
            "• Training Materials: Create step-by-step guides with visuals",
            "• Checklists: Generate compliance and quality checklists",
            "• Reporting: Automated reporting and analysis",
            "• Knowledge Management: Organize and search company knowledge"
        ]
    )

    prs.add_use_case_slide(
        "Finance: Report Writing & Financial Analysis",
        "Finance & Accounting",
        "Finance teams spend time formatting reports, explaining metrics, and creating presentations",
        "Claude accelerates financial analysis, report generation, and helps explain complex financial concepts",
        [
            "3x faster financial reporting",
            "Clearer stakeholder communication",
            "Better insights from financial data",
            "Time freed for strategic analysis"
        ]
    )

    prs.add_content_slide(
        "Finance Department Workflows",
        [
            "• Financial Reports: Draft reports, summaries, analyses",
            "• Data Interpretation: Explain variances and trends",
            "• Budget Analysis: Variances, forecasting, recommendations",
            "• Compliance Documentation: Policy explanations, audit prep",
            "• Executive Summaries: Translate data to business impact",
            "• Metrics Explanation: Help stakeholders understand KPIs"
        ]
    )

    prs.add_use_case_slide(
        "Leadership & Management: Strategic Planning & Reporting",
        "Leadership & Executive Management",
        "Leaders need synthesis of complex information for decision-making",
        "Claude assists with strategy documents, executive summaries, board presentations, and cross-functional communication",
        [
            "Better informed strategic decisions",
            "Clearer executive communications",
            "Faster synthesis of complex information",
            "Time for higher-level strategic thinking"
        ]
    )

    prs.add_content_slide(
        "Leadership Department Workflows",
        [
            "• Strategy Documents: Draft strategic plans, initiatives",
            "• Executive Summaries: Synthesize complex information",
            "• Board Presentations: Compelling narratives and insights",
            "• Cross-functional Communication: Bridge teams with clarity",
            "• Decision Support: Analysis of options and implications",
            "• Culture Communications: Transparent company updates"
        ]
    )

    prs.add_exercise_slide(
        "Real Business Problem Solving",
        [
            "Receive a real challenge from your department",
            "Identify how Claude could help solve it",
            "Draft a prompt or workflow",
            "Test with Claude using real or sample data",
            "Document the solution and time saved"
        ],
        [
            "Problem statement",
            "Claude-powered solution",
            "Test results with data",
            "ROI calculation (time/cost saved)"
        ],
        "2 hours"
    )

    prs.add_exercise_slide(
        "Department-Specific Workflow Lab",
        [
            "Work with your department team",
            "Identify 1 high-priority use case",
            "Design the workflow step-by-step",
            "Create necessary prompts and templates",
            "Run a pilot with real data",
            "Present results and next steps"
        ],
        [
            "Workflow diagram",
            "Prompt templates",
            "Pilot test results",
            "Implementation plan"
        ],
        "3 hours"
    )

    prs.add_content_slide(
        "Week 3 Homework Assignment",
        [
            "Replace one daily manual task with Claude for one week",
            "Document: What task? How often? Manual time?",
            "Measure: Time saved, quality of output, refinements needed",
            "Photograph: Show before/after if possible",
            "Reflection: What would make it even better?",
            "Prepare: Present findings in Week 4"
        ]
    )

    prs.add_content_slide(
        "Week 3 Key Takeaways",
        [
            "✓ Claude applies across all departments and functions",
            "✓ Start with high-impact, repetitive tasks",
            "✓ Measure time saved and quality improvements",
            "✓ Small wins build momentum for larger adoption",
            "✓ Document workflows for team replication",
            "✓ Iterate based on results and feedback"
        ]
    )

    # ========== SECTION 4 ==========
    prs.add_section_slide(
        "WEEK 4: Advanced Claude",
        "Master Projects, Knowledge, Artifacts, and automation"
    )

    # ========== WEEK 4 ==========
    prs.add_learning_objectives_slide([
        "Build and manage Claude Projects",
        "Use Knowledge Files for persistent context",
        "Create and share Artifacts",
        "Understand Claude Code capabilities",
        "Learn about MCP (Model Context Protocol)",
        "Explore integrations and API overview",
        "Process long documents and comparisons"
    ])

    prs.add_content_slide(
        "Advanced Features Overview",
        [
            "• Projects: Persistent workspaces with shared context",
            "• Knowledge Files: Upload docs for ongoing reference",
            "• Artifacts: Create and edit standalone content",
            "• Code: Generate and execute code with Claude Code",
            "• MCP: Model Context Protocol for tool integration",
            "• Integrations: Connect to your existing tools",
            "• API: Build custom applications with Claude"
        ]
    )

    prs.add_content_slide(
        "Projects: Organization & Collaboration",
        [
            "• What: Dedicated workspaces for related conversations",
            "• Create: One-click project creation with custom instructions",
            "• Organization: Group conversations by project or initiative",
            "• Sharing: Invite team members to collaborate",
            "• Custom Instructions: Configure Claude for project-specific behavior",
            "• History: All conversations in one place for reference"
        ]
    )

    prs.add_content_slide(
        "Setting Up Your Projects",
        [
            "Step 1: Create a new project with clear name",
            "Step 2: Write custom instructions (project-specific behavior)",
            "Step 3: Add team members if collaborative",
            "Step 4: Upload relevant documents or knowledge files",
            "Step 5: Start conversations knowing context is maintained",
            "Pro Tip: Use projects for ongoing initiatives, campaigns, or clients"
        ]
    )

    prs.add_content_slide(
        "Knowledge Files Deep Dive",
        [
            "• Purpose: Persistent, reference materials for Claude",
            "• Upload: PDFs, documents directly to project",
            "• Capacity: Multiple files, each up to 20 pages",
            "• Citation: Claude cites sources when using knowledge",
            "• Use Cases: Brand guidelines, company policies, contracts",
            "• Advantage: No need to re-upload every conversation"
        ]
    )

    prs.add_content_slide(
        "Artifacts: Creating Rich Content",
        [
            "• What: Standalone content (documents, code, HTML)",
            "• Types: Markdown docs, code (Python/JS), React components",
            "• Edit: Make changes and see live preview",
            "• Share: Export or share with links",
            "• Use: Create templates, tools, or documentation",
            "• Workflow: Build > Test > Refine > Deploy"
        ]
    )

    prs.add_content_slide(
        "Claude Code Capabilities",
        [
            "• Execute: Run Python code and see immediate results",
            "• Visualize: Create charts, graphs, dashboards",
            "• Generate: Build HTML/CSS/JS apps and tools",
            "• Deploy: Create shareable interactive tools",
            "• Debug: Identify and fix errors with Claude's help",
            "• Integrate: Connect to data and APIs"
        ]
    )

    prs.add_content_slide(
        "Code Examples with Claude",
        [
            "Data Analysis: Load CSV, analyze, visualize with matplotlib",
            "Web Scraping: Extract data from websites",
            "Text Processing: Parse, analyze, transform text",
            "Dashboard: Create interactive HTML dashboards",
            "Automation: Generate scripts to automate tasks",
            "Tools: Build business tools (calculators, converters)"
        ]
    )

    prs.add_content_slide(
        "MCP: Model Context Protocol",
        [
            "• What: Framework for connecting Claude to tools and data",
            "• Purpose: Give Claude access to real-time information",
            "• Examples: Calendar, email, code repositories",
            "• Use Case: Automation, data access, tool integration",
            "• Benefit: Claude can take actions on your behalf",
            "• Status: Enterprise/advanced feature"
        ]
    )

    prs.add_content_slide(
        "Integrations Overview",
        [
            "• Gmail: Search emails, extract information",
            "• Google Drive: Access and analyze documents",
            "• Slack: Post messages and retrieve channel info",
            "• GitHub: Browse repos and understand code",
            "• Notion: Query and update databases",
            "• Custom: Build your own via API"
        ]
    )

    prs.add_content_slide(
        "Claude API Basics",
        [
            "• Access: Build custom applications using Claude",
            "• Models: Choose Opus, Sonnet, or Haiku for your needs",
            "• Pricing: Pay per token, no subscription required",
            "• Documentation: Extensive guides and examples",
            "• SDKs: Python, JavaScript/Node.js, curl",
            "• Use Case: Build chatbots, automation, specialized tools"
        ]
    )

    prs.add_content_slide(
        "Long Document Analysis",
        [
            "• Capability: Process entire books, reports, codebases",
            "• Context Window: 100K-200K tokens (40K-80K words)",
            "• Use Cases: Code review, contract analysis, research",
            "• Technique: Upload PDF, ask questions about content",
            "• Benefit: No need to summarize or extract beforehand",
            "• Accuracy: Claude maintains context throughout document"
        ]
    )

    prs.add_content_slide(
        "Multi-Document Comparison",
        [
            "• Task: Compare multiple documents for differences",
            "• Process: Upload multiple files, ask for comparison",
            "• Use Cases: Contract variations, policy versions, code diffs",
            "• Output: Structured comparison with highlights",
            "• Efficiency: Eliminate manual side-by-side reading",
            "• Example: Compare 3 proposal versions to highlight changes"
        ]
    )

    prs.add_content_slide(
        "Workflow Automation Ideas",
        [
            "• Content Pipeline: Research → Draft → Review → Publish",
            "• Screening Process: Upload → Analyze → Score → Rank",
            "• Analysis Workflow: Gather → Process → Visualize → Report",
            "• Support Process: Ticket → Analyze → Draft Response → Send",
            "• Planning: Brainstorm → Organize → Document → Share",
            "• Continuous: Regular inputs, consistent high-quality outputs"
        ]
    )

    prs.add_exercise_slide(
        "Build Your Advanced Project",
        [
            "Create a new Claude Project for your department",
            "Write custom instructions (2-3 paragraphs)",
            "Upload 2-3 knowledge files (brand guidelines, policies, docs)",
            "Create 3 initial conversations exploring the setup",
            "Document how this improves your workflow"
        ],
        [
            "Project created with custom instructions",
            "Knowledge files uploaded and tested",
            "3 test conversations demonstrating capability",
            "Workflow improvement documentation"
        ],
        "1.5 hours"
    )

    prs.add_exercise_slide(
        "Long Document Analysis Lab",
        [
            "Select a 20+ page document (report, proposal, contract)",
            "Upload to Claude",
            "Ask 5 analytical questions about the content",
            "Create a structured summary with key points",
            "Demonstrate time saved vs. manual review"
        ],
        [
            "Uploaded document",
            "5 questions with detailed answers",
            "Structured summary",
            "Time comparison (manual vs. Claude)"
        ],
        "1 hour"
    )

    prs.add_exercise_slide(
        "Create an Interactive Tool with Artifacts",
        [
            "Identify a tool that would help your department",
            "Ask Claude to create it (HTML/CSS/JS or Python)",
            "Test the functionality with sample data",
            "Refine until it meets your needs",
            "Share with team and gather feedback"
        ],
        [
            "Working tool/artifact",
            "Test results with sample data",
            "Feedback from team members",
            "Documentation for usage"
        ],
        "2 hours"
    )

    prs.add_content_slide(
        "Week 4 Homework Assignment",
        [
            "Design one AI-assisted workflow for your department",
            "Workflow should: Automate 3+ steps, save 5+ hours/week, improve quality",
            "Document: Process flow diagram, Claude prompts, integration points",
            "Prototype: Test workflow with real or sample data",
            "Prepare: Create a 5-minute demo for Week 5 capstone"
        ]
    )

    prs.add_content_slide(
        "Week 4 Key Takeaways",
        [
            "✓ Projects enable persistent, organized Claude usage",
            "✓ Knowledge files provide persistent context",
            "✓ Artifacts create standalone, shareable content",
            "✓ Code execution opens automation possibilities",
            "✓ Integrations connect Claude to your tools",
            "✓ Advanced features unlock enterprise-scale value"
        ]
    )

    # ========== SECTION 5 ==========
    prs.add_section_slide(
        "WEEK 5: AI Adoption & Capstone Project",
        "Implement Claude at scale and complete your capstone project"
    )

    # ========== WEEK 5 ==========
    prs.add_learning_objectives_slide([
        "Understand AI governance and risk management",
        "Master responsible AI principles",
        "Learn change management strategies",
        "Measure and communicate ROI",
        "Avoid common AI implementation mistakes",
        "Build your capstone project",
        "Present your AI-powered solution"
    ])

    prs.add_content_slide(
        "AI Governance Framework",
        [
            "• Policies: Clear guidelines for AI tool usage",
            "• Oversight: Human review of critical AI outputs",
            "• Compliance: Adherence to regulations (GDPR, etc.)",
            "• Security: Protect sensitive data and access",
            "• Transparency: Clear communication about AI use",
            "• Accountability: Track decisions and outcomes"
        ]
    )

    prs.add_content_slide(
        "Responsible AI Principles",
        [
            "✓ Transparency: Disclose when AI is used",
            "✓ Human Oversight: AI augments, not replaces, human judgment",
            "✓ Fairness: Evaluate and mitigate bias",
            "✓ Accountability: Clear responsibility for outcomes",
            "✓ Privacy: Protect personal and sensitive data",
            "✓ Safety: Test extensively before deployment"
        ]
    )

    prs.add_content_slide(
        "Security Best Practices",
        [
            "❌ Never: Share passwords, credentials, or PII with Claude",
            "❌ Never: Upload confidential internal documents",
            "✓ Do: Use privacy-first, encrypted connections",
            "✓ Do: Review outputs before using for decisions",
            "✓ Do: Implement approval workflows for critical tasks",
            "✓ Do: Audit and log AI usage for compliance"
        ]
    )

    prs.add_content_slide(
        "Human-in-the-Loop Review",
        [
            "• Principle: Humans make final decisions on critical matters",
            "• Framework: AI suggests → Human reviews → Human decides",
            "• Critical Tasks: Legal, financial, HR, customer-facing",
            "• Implementation: Workflows requiring sign-off before execution",
            "• Training: Help team understand when to question AI output",
            "• Balance: Automate routine, review complex"
        ]
    )

    prs.add_content_slide(
        "Change Management Strategy",
        [
            "Phase 1: Awareness - Show value, address concerns",
            "Phase 2: Adoption - Hands-on training, quick wins",
            "Phase 3: Integration - Build AI into standard workflows",
            "Phase 4: Optimization - Measure, refine, scale",
            "Phase 5: Culture - AI fluency becomes baseline",
            "Success Metric: 80%+ of relevant teams using Claude weekly"
        ]
    )

    prs.add_content_slide(
        "Measuring Productivity Gains",
        [
            "Track: Time saved, quality improvements, error reduction",
            "Metrics: Hours freed, cost per task, accuracy scores",
            "Before/After: Document baseline, measure improvements",
            "ROI: (Value Gained - Costs) / Costs × 100",
            "Communication: Share wins to drive adoption",
            "Continuous: Reassess quarterly for optimization opportunities"
        ]
    )

    prs.add_content_slide(
        "Calculating ROI: Example",
        [
            "Scenario: Email drafting task",
            "Manual Time: 30 min/email, 10 emails/week = 5 hours",
            "Claude Time: 5 min/email, 10 emails/week = 50 min",
            "Time Saved: 4.17 hours/week = ~217 hours/year",
            "Value: $60/hour × 217 hours = $13,020/year",
            "Cost: Claude subscription $20/month = $240/year",
            "ROI: ($13,020 - $240) / $240 × 100 = 5,325% ROI!"
        ]
    )

    prs.add_content_slide(
        "Best Practices for AI Implementation",
        [
            "✓ Start Small: Pilot with low-risk, high-value tasks",
            "✓ Get Buy-in: Demonstrate value early and often",
            "✓ Train Thoroughly: Invest in education and support",
            "✓ Document Workflows: Create templates and playbooks",
            "✓ Measure Everything: Track metrics and ROI",
            "✓ Iterate Continuously: Refine based on feedback"
        ]
    )

    prs.add_content_slide(
        "Common Implementation Mistakes",
        [
            "❌ Assuming AI is infallible - Always verify outputs",
            "❌ Using same prompts for all contexts - Customize per task",
            "❌ Ignoring security/privacy - Consider data sensitivity",
            "❌ No change management - People are hardest part",
            "❌ Over-automating - Keep humans in the loop",
            "❌ Not measuring impact - Can't improve what you don't track"
        ]
    )

    prs.add_content_slide(
        "Future of AI: Trends to Watch",
        [
            "• Multimodal AI: Better understanding of images and audio",
            "• Real-time Reasoning: Faster, more complex problem-solving",
            "• Specialized Models: Tailored for specific industries/tasks",
            "• AI Agents: Autonomous systems taking actions",
            "• Personalization: AI customized to individual users",
            "• Transparency: Better explainability of AI decisions"
        ]
    )

    prs.add_content_slide(
        "AI Agents Explained",
        [
            "• What: AI that takes autonomous actions toward goals",
            "• How: Plan steps → Execute → Verify → Adapt",
            "• Examples: Booking meetings, writing reports, data analysis",
            "• Benefit: Minimal human oversight for routine tasks",
            "• Current State: Early, enterprise features",
            "• Future: More autonomous, more capabilities"
        ]
    )

    prs.add_content_slide(
        "Business Transformation with AI",
        [
            "Operational: Automate routine tasks, improve efficiency",
            "Strategic: Better decisions through faster analysis",
            "Customer: Personalized experiences, faster service",
            "Innovation: New product/service possibilities",
            "Competitive: Differentiation through AI capabilities",
            "Mindset: From \"Can we?\" to \"How do we scale?\""
        ]
    )

    prs.add_content_slide(
        "Capstone Project Overview",
        [
            "• Goal: Build a complete Claude-powered workflow",
            "• Scope: Solve a real business problem in your department",
            "• Components: Problem statement, solution, demo, ROI",
            "• Duration: Weeks 4-5 (4+ hours of development)",
            "• Deliverable: Live demo + documentation",
            "• Presentation: 5-10 minutes to peers and leadership"
        ]
    )

    prs.add_content_slide(
        "Capstone Project Requirements",
        [
            "✓ Real Business Problem: Address actual departmental challenge",
            "✓ Claude-Powered: Use Claude as core component",
            "✓ Reproducible: Can be replicated by others",
            "✓ Measurable Impact: Calculate time/cost savings",
            "✓ Well-Documented: Instructions, prompts, workflow",
            "✓ Scalable: Can expand to other teams/departments"
        ]
    )

    prs.add_content_slide(
        "Capstone Project Timeline",
        [
            "Week 4 (Hours 1-2): Define problem and solution",
            "Week 4 (Hours 3-4): Build and test workflow",
            "Week 4 (Hours 5-6): Create documentation",
            "Week 5 (Monday): Prepare presentation",
            "Week 5 (Wednesday): Present to group",
            "Week 5 (Friday): Finalize for deployment"
        ]
    )

    prs.add_exercise_slide(
        "Capstone Project Development",
        [
            "Define: Clear problem statement and success criteria",
            "Design: Solution architecture and workflow",
            "Build: Implement with Claude and test thoroughly",
            "Document: Create guides, templates, instructions",
            "Calculate: ROI, time saved, quality metrics",
            "Prepare: Presentation and demo"
        ],
        [
            "Project documentation",
            "Working demonstration",
            "ROI analysis",
            "Deployment instructions"
        ],
        "4-6 hours (across Weeks 4-5)"
    )

    prs.add_exercise_slide(
        "Capstone Presentation Preparation",
        [
            "Create 10-slide deck covering: Problem, Solution, Demo, ROI",
            "Prepare 5-minute verbal presentation",
            "Practice with timing and speaking",
            "Prepare for Q&A about implementation",
            "Create handout with key learnings"
        ],
        [
            "Presentation deck (10 slides)",
            "2-minute demo video",
            "Handout document",
            "Q&A preparation guide"
        ],
        "2 hours"
    )

    prs.add_content_slide(
        "Capstone Presentation Scoring",
        [
            "Problem Clarity (20%): Is the business problem clear?",
            "Solution Innovation (20%): Creative use of Claude?",
            "ROI/Impact (20%): Measurable, meaningful improvements?",
            "Documentation (20%): Clear enough for others to replicate?",
            "Presentation (20%): Engaging, well-structured delivery?"
        ]
    )

    prs.add_content_slide(
        "Week 5 Quiz - Assessment",
        [
            "Covers all 5 weeks of material",
            "Format: 15 multiple choice + 3 short answer questions",
            "Duration: 30 minutes",
            "Passing Score: 80% required",
            "Focus: Application and understanding, not memorization",
            "Review: Solutions provided with explanation"
        ]
    )

    prs.add_content_slide(
        "Program Completion Certificate",
        [
            "Requirements to Earn Certificate:",
            "✓ Attend all 5 weeks (80% attendance minimum)",
            "✓ Pass all 5 weekly quizzes (70% score minimum)",
            "✓ Complete capstone project (meets requirements)",
            "✓ Deliver capstone presentation",
            "✓ Provide feedback survey",
            "Certificate recognizes Claude AI proficiency"
        ]
    )

    prs.add_content_slide(
        "Next Steps: Sustaining Momentum",
        [
            "• Monthly Lunch & Learns: Share wins and learn from peers",
            "• Prompt Library: Curate best prompts company-wide",
            "• Expert Community: Connect advanced users",
            "• ROI Tracking: Quarterly assessment of impact",
            "• Continuous Learning: Advanced workshops as adoption grows",
            "• Integration: Embed Claude into standard tools and workflows"
        ]
    )

    prs.add_content_slide(
        "5-Week Program Summary",
        [
            "Week 1: Foundations (40 slides) - AI, Claude, Features",
            "Week 2: Prompt Engineering (30 slides) - Crafting better prompts",
            "Week 3: Productivity (25 slides) - Department-specific applications",
            "Week 4: Advanced (20 slides) - Projects, Knowledge, Integration",
            "Week 5: Adoption (25 slides) - Governance, ROI, Capstone",
            "Total: 140 slides + interactive exercises + capstone"
        ]
    )

    prs.add_content_slide(
        "Program Key Metrics",
        [
            "Participation: 100+ employees across departments",
            "Completion Rate: Target 85%+ graduation",
            "Adoption: 70%+ using Claude monthly within 6 months",
            "ROI: Target $500K+ annual productivity gains",
            "Satisfaction: 90%+ positive feedback rating",
            "Impact: Transform how teams work with AI"
        ]
    )

    prs.add_content_slide(
        "Final Thoughts: Your AI Journey",
        [
            "• You're now equipped with Claude skills",
            "• Impact multiplies when you share knowledge",
            "• AI is a tool that makes you better at your work",
            "• The future belongs to AI-fluent professionals",
            "• Keep learning, experimenting, and innovating",
            "• Welcome to the AI-powered workforce!"
        ]
    )

    prs.add_title_slide(
        "Congratulations!",
        "You're ready to transform your work with Claude AI"
    )

    return prs


if __name__ == "__main__":
    print("Generating Claude AI Training Program presentation...")
    prs = generate_training_presentation()
    output_path = "/home/user/Self/training-program/presentation/Claude_AI_Training_Program.pptx"
    prs.save(output_path)
    print(f"\n✓ Presentation complete: {output_path}")
