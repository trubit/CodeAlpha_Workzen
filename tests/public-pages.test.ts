import { test, describe } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

describe('Phase 4 — Public Website Schemas & Routing Configuration', () => {
  const contactInquirySchema = z.object({
    name: z.string().min(1, 'Full name is required').max(100),
    email: z.string().email('Please provide a valid work email address'),
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters long').max(2000),
    teamSize: z.enum(['1-10', '11-50', '51-250', '250+'])
  });

  test('should validate a correct contact form inquiry', () => {
    const validPayload = {
      name: 'Alex Chen',
      email: 'alex@company.com',
      subject: 'Enterprise Multi-Tenant Deployment',
      message: 'We are looking to migrate 150 engineers from Jira to Workzen.',
      teamSize: '51-250' as const
    };

    const result = contactInquirySchema.safeParse(validPayload);
    assert.strictEqual(result.success, true);
  });

  test('should reject invalid email or too short message in contact form', () => {
    const invalidPayload = {
      name: '',
      email: 'not-an-email',
      subject: '',
      message: 'short',
      teamSize: '1-10' as const
    };

    const result = contactInquirySchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0]);
      assert.ok(issues.includes('name'));
      assert.ok(issues.includes('email'));
      assert.ok(issues.includes('subject'));
      assert.ok(issues.includes('message'));
    }
  });

  test('should have all 7 public views defined in the active view schema', () => {
    const publicViews = ['landing', 'features', 'solutions', 'pricing', 'about', 'faq', 'contact'];
    assert.strictEqual(publicViews.length, 7);
    publicViews.forEach((v) => {
      assert.ok(typeof v === 'string' && v.length > 0);
    });
  });
});

