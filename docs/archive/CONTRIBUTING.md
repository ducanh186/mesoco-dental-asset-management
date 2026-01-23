# Contributing Guide

## Branch Strategy

```
main (stable, production-ready)
  ├── feature/<name>   # New features
  ├── fix/<issue>      # Bug fixes
  └── hotfix/<name>    # Urgent production fixes
```

### Workflow

1. Create feature branch from `main`
2. Develop & commit with conventional commits
3. Open PR to `main`
4. Get review & approval
5. Squash merge to `main`

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance, dependencies, config |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring without behavioral changes |
| `style:` | Formatting, whitespace (no logic changes) |
| `test:` | Adding or updating tests |
| `perf:` | Performance improvements |

### Examples

```
feat: add equipment QR scanner
fix: correct login validation error message
chore: update Laravel to 12.1
docs: add API endpoint documentation
refactor: extract auth logic to service class
```

### Commit Message Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

---

## Pull Request Checklist

Before submitting a PR, ensure:

### Code Quality
- [ ] Code follows project style (run `./vendor/bin/pint` for PHP)
- [ ] No console.log or debug statements left
- [ ] Variable/function names are descriptive

### Testing
- [ ] Manual testing completed
- [ ] Existing tests pass (`composer test`)
- [ ] New tests added for new features (if applicable)

### Database
- [ ] Migrations included for DB changes
- [ ] Migrations are reversible (`down()` method works)
- [ ] Seeders updated if needed

### Documentation
- [ ] README updated if needed
- [ ] API_CONTRACT.md updated for new endpoints
- [ ] Inline comments for complex logic

### Security
- [ ] Input validation on all user inputs
- [ ] Authorization checked for protected resources
- [ ] No sensitive data in logs or responses
- [ ] CSRF/XSS protections maintained

---

## Code Style

### PHP (Laravel)

- Follow PSR-12
- Use Laravel Pint for formatting: `./vendor/bin/pint`
- Use type hints and return types
- Use Form Request classes for validation

### JavaScript (React)

- Use functional components with hooks
- Use ES6+ features
- Keep components small and focused
- Use descriptive prop names

### Database

- Use snake_case for column names
- Use plural table names (e.g., `users`, `equipment`)
- Always add indexes for foreign keys
- Use soft deletes for important data

---

## Getting Help

- Check existing issues before creating new ones
- Provide clear reproduction steps for bugs
- Include environment details (PHP version, OS, etc.)
