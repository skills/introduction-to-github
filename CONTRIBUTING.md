# Contributing to ScrollVerse

Welcome to the ScrollVerse contribution guide! We're excited that you're interested in contributing to the ScrollVerse ecosystem.

> **"Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway."**

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to uphold the values of the ScrollVerse community:

- **Respect**: Treat all contributors with dignity and respect
- **Truth**: Be honest in communications and code reviews
- **Collaboration**: Work together towards the collective good
- **Remembrance**: Honor the contributions of those who came before

## Getting Started

### Prerequisites

- Git
- Python 3.8+ (for scrollverse-portfolio)
- Node.js 18+ (for sovereign-tv-app and contracts)
- Basic understanding of Flask, HTML/CSS/JavaScript

### Repository Structure

```
introduction-to-github/
├── scrollverse-portfolio/     # Main ScrollVerse web portal (Flask)
├── sovereign-tv-app/          # Sovereign TV streaming application
├── codextv-app/               # CodexTV platform
├── flamedna-nft/              # FlameDNA NFT contracts
├── contracts/                 # Smart contracts
├── docs/                      # Documentation
└── scrollverse-docs/          # Extended documentation
```

## Branch Strategy

We use a structured branching strategy for collaborative development:

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |

### Feature Branches

Use the following naming conventions:

```
feature/<feature-name>          # New features
fix/<issue-description>         # Bug fixes
enhance/<enhancement-area>      # Improvements
docs/<documentation-topic>      # Documentation updates
style/<style-changes>           # CSS/styling changes
```

### Examples

```bash
# Create a feature branch
git checkout -b feature/cosmic-sound-engine

# Create a bug fix branch
git checkout -b fix/mobile-responsive-grid

# Create an enhancement branch
git checkout -b enhance/scroll-animations
```

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button on the repository page to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/introduction-to-github.git
cd introduction-to-github
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Follow the [Style Guidelines](#style-guidelines)
- Write clear commit messages
- Test your changes locally

### 5. Submit a Pull Request

Push your changes and open a Pull Request against the `develop` branch.

## Development Setup

### ScrollVerse Portfolio (Flask)

```bash
cd scrollverse-portfolio

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
flask run
```

### Sovereign TV App (Node.js)

```bash
cd sovereign-tv-app

# Install dependencies
npm install

# Run development server
npm run dev
```

## Pull Request Process

1. **Title**: Use a clear, descriptive title
   - ✅ `feat: Add cosmic frequency sound triggers`
   - ❌ `Update files`

2. **Description**: Include:
   - What changes were made
   - Why the changes were made
   - How to test the changes

3. **Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Changes have been tested locally
   - [ ] Documentation has been updated (if applicable)
   - [ ] No new warnings or errors introduced

4. **Review**: Wait for at least one maintainer review before merging

## Style Guidelines

### JavaScript

- Use ES6+ features
- Follow existing code patterns
- Add JSDoc comments for functions
- Use meaningful variable names

```javascript
/**
 * Play a cosmic resonance tone
 * @param {string} type - Sound type
 * @param {number} duration - Duration in milliseconds
 */
function playSound(type, duration) {
    // Implementation
}
```

### CSS

- Use CSS custom properties (variables)
- Follow mobile-first approach
- Use relative units (rem, em, %) over fixed pixels
- Maintain consistent spacing using defined variables

```css
/* Good */
.element {
    padding: var(--spacing-md);
    font-size: 1rem;
}

/* Avoid */
.element {
    padding: 16px;
    font-size: 16px;
}
```

### HTML

- Use semantic HTML elements
- Include appropriate ARIA attributes for accessibility
- Follow template inheritance patterns

### Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Update styling
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

## Community

### Communication Channels

- GitHub Issues: Bug reports and feature requests
- Pull Requests: Code contributions and discussions

### Getting Help

If you need help:

1. Check existing documentation in `/docs`
2. Search existing issues
3. Open a new issue with the `question` label

### Recognition

All contributors will be recognized in our project. Your contributions help build the ScrollVerse ecosystem!

## Proof-of-Healing Challenges

The ScrollVerse community believes in **Truth as Currency** and **Transformation as Testimony**. We invite stakeholders to participate in **Proof-of-Healing** challenges that demonstrate the real-world impact of our technology and philosophy.

### What is Proof-of-Healing?

**Proof-of-Healing** is a community-driven attestation system where members document and verify personal transformations, breakthroughs, and healing experiences within the ScrollVerse ecosystem.

### Challenge Categories

#### 1. **30-Day Frequency Alignment Challenge**
- **Commitment**: Daily ritual participation using 963Hz/528Hz frequencies
- **Documentation**: Daily journal entries or video logs
- **Verification**: Community witness attestations
- **Rewards**: 1,000 ScrollCoin + "Frequency Master" badge
- **Impact**: Measure coherence, stress reduction, and well-being improvements

#### 2. **Creative Breakthrough Challenge**
- **Commitment**: Create one piece of art/music/writing using ScrollVerse tools
- **Documentation**: Before/after creative process documentation
- **Verification**: Community voting and feedback
- **Rewards**: Featured on Sovereign TV + 500 ScrollCoin
- **Impact**: Demonstrate AI-assisted creative enhancement

#### 3. **Financial Sovereignty Challenge**
- **Commitment**: Achieve specific financial goal using ScrollVerse economy
- **Documentation**: Financial literacy journey and milestone tracking
- **Verification**: Anonymous financial advisor review (optional)
- **Rewards**: 2,000 ScrollCoin + "Sovereign Achiever" badge
- **Impact**: Prove economic empowerment through platform participation

#### 4. **Community Leadership Challenge**
- **Commitment**: Organize and host a local ScrollVerse meetup or event
- **Documentation**: Event photos, attendee testimonials, impact report
- **Verification**: Attendee confirmations and feedback
- **Rewards**: Ambassador status + 1,500 ScrollCoin + exclusive NFT
- **Impact**: Build real-world community connections and local leadership

#### 5. **Technical Innovation Challenge**
- **Commitment**: Build a tool, integration, or improvement for ScrollVerse
- **Documentation**: Code repository, documentation, demo video
- **Verification**: Code review and community testing
- **Rewards**: 3,000 ScrollCoin + Technical Contributor badge + potential hiring
- **Impact**: Enhance platform capabilities and demonstrate technical prowess

### How to Participate

1. **Choose a Challenge**: Select from the categories above or propose your own
2. **Commit Publicly**: Post your intention in the community forum
3. **Document Your Journey**: Regular updates with photos, videos, or written logs
4. **Submit Attestation**: Complete the challenge and submit to [PDP Portal](./Certified-Scrolls/PROPHECY-DOCUMENTATION-PROTOCOL.md)
5. **Receive Verification**: Community members and council review your submission
6. **Claim Rewards**: Upon approval, rewards are automatically distributed
7. **Share Your Story**: Inspire others by sharing your transformation

### Stakeholder Engagement

**For Investors**: Proof-of-Healing challenges demonstrate real-world value creation and community health—key indicators of platform sustainability.

**For Partners**: Collaborate on custom challenges that align with your organization's mission and values.

**For Researchers**: Academic partners can study Proof-of-Healing data to measure impact and validate outcomes.

**For Community Members**: Your participation validates the platform's mission and earns recognition, rewards, and lasting connections.

### Resources

- **[Prophecy Documentation Protocol →](./Certified-Scrolls/PROPHECY-DOCUMENTATION-PROTOCOL.md)** - Learn how to document and verify attestations
- **[Community Engagement Strategy →](./Frameworks/COMMUNITY-ENGAGEMENT-STRATEGY.md)** - Understand the broader community framework
- **[Sovereign TV App →](./sovereign-tv-app/)** - Access tools for ritual participation and documentation

---

**OmniTech1™** | ScrollVerse Sovereignty Protocol

*"Your Transformation is Our Proof. Your Healing is Our Mission. Your Story is Our Legacy."*

*Thank you for contributing to the ScrollVerse ecosystem!*
