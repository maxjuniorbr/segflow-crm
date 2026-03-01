import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Alert, Button, Input, Card, LoadingState, EmptyState } from './UIComponents';

describe('UIComponents accessibility', () => {
    it('Alert has no a11y violations', async () => {
        const { container } = render(<Alert variant="error">Error message</Alert>);
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('Button has no a11y violations', async () => {
        const { container } = render(<Button>Click me</Button>);
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('Input with label has no a11y violations', async () => {
        const { container } = render(
            <div>
                <label htmlFor="test-input">Name</label>
                <Input id="test-input" />
            </div>
        );
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('Input with error shows aria-invalid', async () => {
        const { container } = render(
            <div>
                <label htmlFor="err-input">Name</label>
                <Input id="err-input" error="Required field" />
            </div>
        );
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('Card has no a11y violations', async () => {
        const { container } = render(<Card>Content</Card>);
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('LoadingState has no a11y violations', async () => {
        const { container } = render(<LoadingState />);
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });

    it('EmptyState has no a11y violations', async () => {
        const { container } = render(<EmptyState title="No items found" />);
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });
});
