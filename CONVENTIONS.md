# Development Conventions
These are the conventions you want to enforce during the development of this software project.

## 🎯 Code Style & Formatting

### Backend
- **PHP Version**: Use PHP 8.0+ features and syntax
- **Class Names**: PascalCase (`DataFetcher`, `AIAnalyzer`, `EmailService`)
- **Method Names**: camelCase (`getConnection`, `detectPatterns`, `sendOpportunityNotification`)
- **Variables**: camelCase (`$marketData`, `$apiKey`, `$confidenceLevel`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_SCAN_INTERVAL`, `VAPID_PUBLIC_KEY`)
- **File Names**: kebab-case matching class names (`data-fetcher.php`, `ai-analyzer.php`)
- **Database**: Use prepared statements with PDO, snake_case for table/column names
- **Error Handling**: Always use try-catch blocks with proper logging

### JavaScript (Frontend)
- **ES6+ Features**: Use modern JavaScript (arrow functions, async/await, destructuring, classes)
- **Class Names**: PascalCase (`ForexScoutApp`, `ApiService`, `Dashboard`)
- **Functions/Variables**: camelCase (`loadNotifications`, `apiService`, `refreshStats`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `WEBSOCKET_PORT`)
- **File Names**: kebab-case (`api-service.js`, `notification-service.js`, `websocket-client.js`)
- **Components**: Class-based with `render()`, `cleanup()`, and async methods
- **DOM Queries**: Use modern methods (`getElementById`, `querySelector`), avoid jQuery

### CSS/HTML (Frontend)
- **Bootstrap 5**: Primary framework, use utility classes consistently
- **Custom Classes**: Follow existing patterns (`.stat-card`, `.opportunity-card`, `.confidence-badge`)
- **Responsive Design**: Mobile-first approach, test on multiple screen sizes
- **Icons**: Bootstrap Icons exclusively (`bi-search`, `bi-bullseye`, `bi-bell`)
- **Accessibility**: Semantic HTML, proper ARIA labels, screen reader support

## 📁 File Organization

### Directory Structure (Established Pattern)
```
├── assets/
│   ├── css/app.css    # Custom styles with CSS variables
│   └── js/            # Core services 
└── index.html         # Single entry point with Bootstrap CDN
```

### Component Architecture Pattern
```javascript

```

## 📝 Documentation Standards

### Code Comments

### Component Documentation
```javascript
/**
 * NotificationService - Handles all notification types
 * - Browser push notifications with VAPID authentication
 * - Toast notifications as fallback for HTTP contexts
 * - Service worker integration for background notifications
 * - Graceful degradation based on browser capabilities
 */
class ExampleService {
    // Implementation
}
```

## 🚀 Deployment Considerations


### Push Notification Deployment
- Generate unique VAPID keys for production: `npx web-push generate-vapid-keys`
- Configure VAPID_SUBJECT with valid email address
- Test push notifications on both HTTP (localhost) and HTTPS (production)
- Implement subscription cleanup for inactive endpoints

## 🔮 Phase-Based Development

### Current Phase 4 Standards
- Prioritize real-time features and SSE implementation
- Maintain backward compatibility with existing components
- Implement comprehensive error handling and fallbacks
- Document all new features and configuration options
- Ensure push notifications work across all supported browsers

### Quality Gates
- All features must work on both HTTP (localhost) and HTTPS
- Mobile responsiveness is mandatory for all components
- API rate limits must be respected and monitored
- Real-time features must have polling fallbacks
- Push notifications must gracefully degrade to toast notifications
- Service worker must handle offline scenarios
- Error handling must provide user-friendly feedback

## 📝 Bug Reporting & Feedback Management

### FEEDBACK.md File Structure
The project uses `FEEDBACK.md` to track user feedback, bugs, and feature requests in a structured format:

```markdown
## FEEDBACK
What users are saying. Feedback may trigger bug or feature request items.
- User feedback items listed with bullet points
- Include context and user sentiment

## BUGS  
Things that don't work as expected, are degraded, broken, annoying or just fell through the cracks.
- Bug reports with clear descriptions
- Include reproduction steps when available

## FEATURE REQUESTS
Suggestions to add/enhance/change behaviours.
Legend: [] open, [U] Under consideration, [R] Rejected, [A] Accepted, [I] Implemented
- Feature requests with status tracking
```

### Feedback Management Process

#### Adding New Items
```markdown
# User Feedback
- Quote or paraphrase user feedback directly
- Include context about user experience level
- Note if feedback is recurring from multiple users

# Bug Reports
- Clear, concise description of the issue
- Steps to reproduce (if known)
- Expected vs actual behavior
- Browser/environment details (if relevant)

# Feature Requests
- Start with [] (open) status
- Clear description of requested functionality
- Include user benefit/use case
- Consider technical complexity and project alignment
```

#### Status Management for Feature Requests
- **[] Open**: New request, not yet evaluated
- **[U] Under Consideration**: Being evaluated for feasibility and priority
- **[R] Rejected**: Decided against implementation (include brief reason)
- **[A] Accepted**: Approved for development, will be added to TODO.md
- **[I] Implemented**: Completed and deployed

#### Workflow Integration
1. **Regular Review**: Review FEEDBACK.md weekly during sprint planning
2. **Validation Required**: All items require careful consideration and explicit user confirmation before action
3. **Migration to TODO.md**: Accepted features move to appropriate phase in TODO.md
4. **Bug Prioritization**: Critical bugs get immediate attention, others scheduled in sprints
5. **User Communication**: Update users when their feedback results in changes

#### Quality Gates
- No action taken on feedback without explicit developer/maintainer approval
- All bug reports verified before marking as accepted
- Feature requests evaluated against project roadmap and technical constraints
- User feedback acknowledged and responded to appropriately

### Documentation Standards
- Keep FEEDBACK.md entries concise but complete
- Use consistent formatting for easy scanning
- Include dates for time-sensitive feedback
- Reference specific components or features when applicable
- Maintain professional tone even for negative feedback

---
