# Contributing to MiniMaxi Space

Thank you for your interest in contributing to MiniMaxi Space! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Provide clear reproduction steps
4. Include environment details

### Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Describe the problem your feature solves
4. Provide implementation suggestions

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit the pull request

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/multichain-btcfi-repository.git
cd multichain-btcfi-repository

# Install dependencies
cd multichain-btcfi
pnpm install

# Start development server
pnpm dev
```

### Code Style

We use:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting and formatting:
```bash
pnpm lint
pnpm format
```

### Commit Messages

Use conventional commits:
```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: code style changes
- refactor: code refactoring
- test: adding or updating tests
- chore: build/config changes

Examples:
feat(bridge): add atomic swap functionality
fix(ui): resolve navigation menu issue
docs(readme): update deployment instructions
```

## Pull Request Process

1. **Before Submitting**
   - Run all tests: `pnpm test`
   - Check linting: `pnpm lint`
   - Format code: `pnpm format`
   - Update documentation if needed

2. **Pull Request Template**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes
   - Add tests for new features

3. **Review Process**
   - All PRs require at least one review
   - Address feedback promptly
   - Make requested changes
   - Ensure CI passes

## Project Structure

```
multichain-btcfi-repository/
├── multichain-btcfi/          # Main application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── types/            # TypeScript definitions
│   │   └── styles/           # Global styles
│   ├── public/               # Static assets
│   └── package.json          # Dependencies
├── docs/                     # Documentation
├── .github/                  # GitHub workflows
└── README.md                 # Project overview
```

## Component Guidelines

### Component Structure

```typescript
// Example component structure
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case (`user-profile.tsx`)
- **CSS Classes**: kebab-case (`user-profile-card`)

### Best Practices

1. **React Components**
   - Use TypeScript for all components
   - Implement proper prop types
   - Use functional components with hooks
   - Follow single responsibility principle

2. **State Management**
   - Use React hooks for local state
   - Use context for global state
   - Keep state as close to usage as possible

3. **Performance**
   - Use React.memo for expensive components
   - Implement useMemo and useCallback appropriately
   - Optimize re-renders

## Testing Guidelines

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component>Test Content</Component>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

### Integration Tests

- Test component interactions
- Test user workflows
- Test API integrations

### E2E Tests

- Critical user paths
- Cross-browser compatibility
- Performance testing

## Documentation

### Code Documentation

```typescript
/**
 * Calculates the cross-chain swap rate between two assets
 * @param fromAsset - Source asset symbol
 * @param toAsset - Target asset symbol
 * @param fromChain - Source blockchain
 * @param toChain - Target blockchain
 * @returns Promise resolving to swap rate
 */
export const calculateSwapRate = async (
  fromAsset: string,
  toAsset: string,
  fromChain: string,
  toChain: string
): Promise<number> => {
  // Implementation
};
```

### README Updates

- Update relevant documentation
- Add usage examples
- Include breaking changes

## Security Guidelines

1. **Never commit secrets**
2. **Use environment variables**
3. **Validate all inputs**
4. **Follow OWASP guidelines**
5. **Regular security updates**

## Release Process

1. **Version Bump**
   - Update package.json version
   - Update CHANGELOG.md

2. **Release Notes**
   - Summarize changes
   - Include breaking changes
   - Link to full changelog

3. **Deployment**
   - Run full test suite
   - Deploy to staging
   - Perform smoke tests
   - Deploy to production

## Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code review discussions

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

## Questions?

Don't hesitate to ask! You can:
- Open a GitHub issue
- Start a GitHub discussion
- Email: lawrencezcl@outlook.com

Thank you for contributing to MiniMaxi Space! 🚀